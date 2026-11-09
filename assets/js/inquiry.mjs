// 강의 문의 양식 — 실제 접수 처리 (education-inquiry.html)
// 1) 브라우저 검증 → 2) 스팸 방어(숨은 칸·최소 작성 시간·중복 제출) → 3) Firestore `inquiries`에 저장(서버 측 검증 = firestore.rules)
// 4) Netlify Forms에도 함께 전송(운영자가 Netlify에서 양식 감지·이메일 알림을 켜 두면 dearname27@naver.com 으로 알림)
// 저장에 성공했을 때만 "접수되었습니다"를 표시하고, 실패하면 접수되지 않았다고 알린 뒤 메일로 보내는 방법을 안내합니다.
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { validateInquiry, looksLikeBot, inquiryFingerprint, toInquiryDoc, toMail, FIELDS } from './inquiry-core.mjs';

const CONTACT_EMAIL = 'dearname27@naver.com';
const firebaseConfig = {
    projectId: 'philosophyaiedumain', appId: '1:791707583638:web:b86d59d52a20330baaaeb7',
    apiKey: 'AIzaSyBylDxamogm1_g2URVxGQFz_c05pOWqjEI', authDomain: 'philosophyaiedumain.firebaseapp.com',
    messagingSenderId: '791707583638',
};

const form = document.getElementById('inquiryForm');
if (form) {
    const openedAt = Date.now();
    const $ = (id) => document.getElementById(id);
    const btn = form.querySelector('.submit-btn');
    const result = $('inquiryResult');
    let submitting = false;
    let lockedUntil = 0; // 접수 직후 연타로 빈 양식이 다시 제출되는 것을 막음

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // ?topic= 으로 넘어온 희망 프로그램 미리 선택
    const topic = new URLSearchParams(location.search).get('topic');
    if (topic) {
        const sel = $('program');
        const v = topic.trim().slice(0, 60);
        let opt = [...sel.options].find(o => o.value === v || o.value.replace(/^[A-D]\.\s*/, '') === v);
        if (!opt) { opt = new Option(v, v); sel.add(opt, 1); }
        sel.value = opt.value;
    }

    const fieldIds = [...Object.keys(FIELDS), 'consent'];
    function readForm() {
        const raw = {};
        for (const k of Object.keys(FIELDS)) raw[k] = $(k) ? $(k).value : '';
        raw.consent = $('consent').checked;
        return raw;
    }
    function setFieldError(k, msg) {
        const input = $(k), err = $(k + 'Error');
        if (!input) return;
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
        const group = input.closest('.form-group');
        if (group) group.classList.toggle('error', !!msg);
        if (err) { err.textContent = msg || ''; err.classList.toggle('show', !!msg); }
    }
    function showErrors(errors) { for (const k of fieldIds) setFieldError(k, errors[k]); }
    function setResult(kind, html) {
        result.className = 'inquiry-result ' + kind;
        result.innerHTML = html;
        result.hidden = false;
        result.focus();
    }
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // 오류가 표시된 칸은 고치는 즉시(입력 중) 오류를 지웁니다.
    // (칸을 벗어날 때 오류를 바꾸면 화면이 밀려 다른 곳이 눌릴 수 있어 blur 검증은 하지 않습니다)
    for (const k of fieldIds) {
        const el = $(k);
        if (!el) continue;
        el.addEventListener(k === 'consent' || el.tagName === 'SELECT' ? 'change' : 'input', () => {
            if (!$(k + 'Error')?.classList.contains('show')) return;
            setFieldError(k, validateInquiry(readForm()).errors[k]);
        });
    }

    async function sendToNetlifyForms(d) {
        // 운영자가 Netlify에서 양식 감지를 켜지 않았다면 404가 나며, 이 경우에도 Firestore 접수에는 영향이 없습니다.
        try {
            const body = new URLSearchParams({ 'form-name': 'education-inquiry', ...Object.fromEntries(Object.keys(FIELDS).map(k => [k, d[k] || ''])), consent: 'yes' });
            const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
            return res.ok;
        } catch { return false; }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitting || Date.now() < lockedUntil) return;
        result.hidden = true;
        const { ok, errors, data } = validateInquiry(readForm());
        showErrors(errors);
        if (!ok) {
            const first = fieldIds.find(k => errors[k]);
            setResult('error', `입력 내용을 확인해 주세요. <b>${Object.keys(errors).length}개 항목</b>에 문제가 있습니다.`);
            if (first && $(first)) $(first).focus();
            return;
        }
        if (looksLikeBot({ honeypot: $('bot-field').value, openedAt })) {
            setResult('error', '자동 입력으로 의심되어 접수하지 않았습니다. 잠시 후 다시 시도해 주시거나 이메일로 문의해 주세요.');
            return;
        }
        const fp = inquiryFingerprint(data);
        let recent = null;
        try { recent = sessionStorage.getItem('inquiry.last'); } catch { /* 무시 */ }
        submitting = true;
        btn.disabled = true;
        if (recent === fp && !confirm('같은 내용의 문의를 이미 보내셨습니다. 한 번 더 보낼까요?')) { submitting = false; btn.disabled = false; return; }

        btn.classList.add('loading');
        try {
            const ref = await addDoc(collection(db, 'inquiries'), toInquiryDoc(data, serverTimestamp()));
            try { sessionStorage.setItem('inquiry.last', fp); } catch { /* 무시 */ }
            await sendToNetlifyForms(data);
            if (typeof window.gtag === 'function') window.gtag('event', 'inquiry_submit', { referral_source: data.referral || '(미선택)', topic: data.program || '(미선택)', method: 'form' });
            form.reset();
            showErrors({});
            setResult('success', `<b>문의가 접수되었습니다.</b> 확인 후 입력하신 이메일(${esc(data.email)})로 답변드리겠습니다.<br><small>접수 번호: ${esc(ref.id.slice(0, 8))}</small>`);
            window.__lastInquiryId = ref.id;
            lockedUntil = Date.now() + 4000;
        } catch (err) {
            console.error('문의 저장 실패:', err);
            const mail = toMail(data);
            const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`;
            setResult('error', `<b>문의가 접수되지 않았습니다.</b> 네트워크 또는 서버 문제로 저장하지 못했습니다. 작성하신 내용은 그대로 남아 있습니다.<br>
                잠시 후 다시 보내시거나, <a href="${esc(href)}">메일 앱으로 같은 내용 보내기</a> 또는 <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>로 직접 보내 주세요.`);
        } finally {
            submitting = false;
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    });
}
