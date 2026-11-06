// /programs — 각 프로그램 블록에 해당 프로그램의 공개 후기(최대 2개)를 붙입니다.
import { fetchPublishedReviews } from './firestore-public.mjs';
import { renderReviewCard, sortReviews } from './review-core.mjs';

const slots = document.querySelectorAll('.program-reviews[data-program]');
if (slots.length) {
    fetchPublishedReviews().then(list => {
        const sorted = sortReviews(list);
        slots.forEach(slot => {
            const mine = sorted.filter(r => r.program === slot.dataset.program).slice(0, 2);
            if (mine.length) {
                slot.innerHTML = `<div class="rv-grid">${mine.map(r => renderReviewCard(r)).join('')}</div><p class="small"><a href="/reviews">후기 전체 보기</a></p>`;
            }
        });
    }).catch(e => console.warn('후기 불러오기 실패:', e));
}
