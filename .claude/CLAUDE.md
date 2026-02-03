# Project & Personal Context

## About Me
- 한국어 사용자
- 게임/인터랙티브 콘텐츠 개발에 관심
- 프론트엔드 경험 있음 (HTML/CSS/JS, npm 환경 익숙)
- 3D 개발은 학습 단계 (Three.js 관심)

## Work Style
- 빠른 프로토타입 → 피드백 → 점진적 개선 선호
- 짧고 직관적인 피드백 ("너무 커", "눈이 무섭다")
- 여러 요청을 한 메시지에 묶어서 전달
- 문제 발견 시 즉시 피드백
- 버전 태깅으로 진행상황 체크포인트

## Preferences
- **좋아함**: 귀여운 것, 힐링, 생동감, 미니멀/심플
- **싫어함**: 징그러운 것, 과도하게 큰 것, 복잡한 것
- "귀여운" = 동글동글, 큰 눈(but 과하지 않게), 파스텔톤, 반짝임
- Karpathy 스타일 = 미니멀하지만 특징이 잘 드러나는 디자인

## Don't Do (Anti-patterns)
- 눈을 너무 크게 그리지 말 것 (무서워짐)
- 캐릭터 스케일 과하게 키우지 말 것
- UI 요소가 배경과 안 맞게 배치하지 말 것
- 텍스트가 캐릭터 방향에 따라 반전되지 않게 할 것

## Communication
- 한국어로 대화
- 이모지 필요 시에만 사용
- 간결한 설명 선호
- 테이블/리스트 형식 선호

---

# Session Retrospective (2024)

## Pixel Cat Cafe Project

### What Went Well
- 아이디어 브레인스토밍 → 빠른 방향 결정
- v1 → v2 점진적 개선 흐름
- 즉각적 피드백으로 빠른 수정

### What Could Improve
- 초반에 "귀여움"의 구체적 기준 공유했으면 더 빨랐을 것
- 스케일/크기 관련 선호도 미리 알았으면 좋았을 것

### Decisions Made
- 기술: Pixi.js + Vite + Vanilla JS
- 스타일: 픽셀 아트
- 인터랙션: 쓰다듬기(부위별), 간식, 장난감
- 다음 방향: Three.js 3D 버전 (스타일라이즈드)

---

# Learning Resources

## Three.js (3D Web)
- [Three.js Journey](https://threejs-journey.com/) - Bruno Simon의 최고 강의
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Discover Three.js](https://discoverthreejs.com/) - 무료 온라인 북

## Blender (3D Modeling)
- [Blender Guru Donut Tutorial](https://www.youtube.com/playlist?list=PLjEaoINr3zgFX8ZsChQVQsuDSjEqdWMAD)
- [Grant Abbitt Low Poly](https://www.youtube.com/c/GrantAbbitt) - 로우폴리 전문

## Game Design
- [Game Maker's Toolkit](https://www.youtube.com/c/MarkBrownGMT) - 게임 디자인 분석
- [Miziziziz](https://www.youtube.com/c/Miziziziz) - 인디 게임 개발

## Pixel Art
- [Lospec](https://lospec.com/) - 팔레트, 튜토리얼
- [MortMort](https://www.youtube.com/c/MortMort) - 픽셀 아트 튜토리얼

---

# Recommended Skills

## To Install
```bash
# Three.js 개발
claude skill install cloudai-x/threejs-skills@threejs-fundamentals
claude skill install cloudai-x/threejs-skills@threejs-animation

# 픽셀 아트
claude skill install omer-metin/skills-for-antigravity@pixel-art-sprites

# 회고/리뷰
claude skill install aj-geddes/useful-ai-prompts@retrospective-facilitation
```

## To Create (없는 것)
- **healing-game-design**: 힐링 게임 특화 디자인 패턴, UX 원칙
- **pixi-game-dev**: Pixi.js 게임 개발 베스트 프랙티스
- **toon-shader**: Three.js 툰셰이딩 구현 가이드

---

# Prompting Tips (For Me)

## 더 효과적인 요청 방법
1. **초반에 구체적 기준 제시**: "귀여운 = 동글동글, 단순한 눈, 파스텔톤"
2. **참고 이미지/게임 언급**: "동숲 느낌으로", "스타듀밸리처럼"
3. **안티패턴 미리 공유**: "너무 크거나 복잡한 건 싫어"
4. **우선순위 명시**: "일단 핵심만, 나머지는 나중에"

## 피드백 시
- 문제 + 원하는 방향 함께 제시
- "눈이 무섭다" → "눈이 무섭다. 더 작고 단순하게"
