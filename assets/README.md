# assets

사이트에서 사용하는 이미지 파일을 보관하는 폴더입니다.

## mascot.jpg
메인 페이지 히어로(상단)에 표시되는 "필로소피 AI" 마스코트 이미지입니다.
- 파일 경로: `assets/mascot.jpg`
- 이 파일이 없으면 히어로는 이미지 없이 1단 레이아웃으로 자연스럽게 표시됩니다.
- 교체하려면 같은 경로/파일명으로 새 이미지를 덮어쓰면 됩니다.

## 필로소피 AI 교육 사진 / 필로소피 AI 봉사단 사진
업로드한 **원본 사진**을 보관하는 폴더입니다. 웹페이지에서 직접 불러오지는 않습니다.
- 파일명에 담긴 날짜·기관·주제 정보가 교육 문의 페이지의 이력 내용이 됩니다.
  (예: `260727 경상국립대 물리 정교사(1급) 자격 연수 [AI 리터러시 교육] 1.jpg`)

## web/
교육 문의 페이지(`education-inquiry.html`)와 메인 페이지에서 실제로 불러오는
**웹 최적화 사본**입니다. 원본(약 24MB)을 긴 변 1600px·품질 82로 줄여 약 4MB로 만든 파일입니다.

| 파일명 규칙 | 내용 |
| --- | --- |
| `edu-YYMM-<기관>.jpg` | 교육·연수 사진 (예: `edu-2607-gnu-1.jpg`) |
| `vol-*.jpg` | 봉사단 스터디 / 노트북 전달 사진 |

### 사진을 새로 추가하려면
1. 원본을 `필로소피 AI 교육 사진` 또는 `필로소피 AI 봉사단 사진` 폴더에 올립니다.
2. 아래처럼 웹용 사본을 만들어 `assets/web/`에 저장합니다. (Python + Pillow)

   ```python
   from PIL import Image, ImageOps
   im = ImageOps.exif_transpose(Image.open('원본경로.jpg')).convert('RGB')
   w, h = im.size
   if max(w, h) > 1600:
       s = 1600 / max(w, h)
       im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
   im.save('assets/web/edu-2608-example.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
   ```
3. `education-inquiry.html`의 `#history`(교육 이력) 또는 `#volunteer`(봉사단) 영역에
   기존 카드를 복사해 경로·날짜·설명을 바꿔 넣습니다.
   상단 숫자 요약(`.cred-grid`)의 횟수도 함께 수정해 주세요.
