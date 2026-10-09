# video-studio – 수출이야기 숏폼 영상 제작 (0단계 시안)

## 현재 상태
- `src/PriceReveal.tsx`: 가격 반전형 샘플 (30초, 가상 데이터, 음성 없음).
- 준열님 피드백: "흥미가 안 느껴지고 지루한 PPT 같다" → 다음 버전에서 개선 예정.
- `public/sfx/`: FFmpeg로 직접 합성한 효과음 (외부 음원 아님, 저작권 문제 없음).
- `public/Pretendard-*.woff2`: 무료 한글 글꼴 Pretendard (SIL OFL 1.1, `Pretendard-LICENSE.txt`).

## 다음 버전 계획 (준열님 최종 확인 대기)
- 음성: Gemini TTS (키는 클라우드 환경 네트워크 시크릿 "Gemini"에 있음. 헤더 x-goog-api-key가 자동으로 붙는다. 저장소에 절대 넣지 않는다).
- 캐릭터: 코드로 그린 2D 만화 캐릭터 – "수출 박사" 아저씨 + 말하는 자동차의 티키타카 상황극.
  화면에 "상황극 · 가상 데이터" 표시.
- PPT 느낌 개선: 준열님 말투 대본, 단어 단위 자막, 장면 안 카메라 움직임, 비트에 맞춘 전환, 실제 차 사진.

## 라이선스 메모
- Remotion: 상업적 사용 전 평가 목적 무료. 실제 업로드용 사용 전 개인 무료 대상인지 Remotion에 확인 필요
  (준열님 문의 예정). 안 되면 HTML 그래픽 + FFmpeg 무료 조합으로 전환.

## 실행 방법 (개발용)
```
npm install
npm run render
```
클라우드 환경에서는 `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` 를 붙여 실행했다.
