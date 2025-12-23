# Bento Design Guide for News Briefing App

이 문서는 프로젝트 전체에서 참조해야 하는 디자인 원칙과 패턴을 정의합니다.

---

## 1. 전체 디자인 패턴 정의 (Design Pattern)

### 1-1. Bento 디자인을 "텍스트 앱"에 적용하는 방식

Bento의 핵심은 **격자(Grid)** 와 **블록(Block)** 이다.
이미지가 없어도 Bento 느낌을 살릴 수 있다.

#### 핵심 원칙 4가지

1. 모든 정보는 '카드 블록' 안에만 존재
2. 카드는 정렬되지만, 완벽히 동일하지 않아도 됨
3. 여백이 곧 디자인
4. 색은 구분용이지 장식용이 아님

### 1-2. 레이아웃 패턴 (웹 & 앱 공통)

#### 모바일 / 앱 (기본)
```
[Header]
[Card]
[Card]
[Card]
```

#### 웹 (데스크톱)
```
        [Card]
        [Card]
        [Card]
```

> **중요**: Bento지만 2열/3열 그리드는 사용하지 않음
>
> 이유:
> - 텍스트 밀도가 높아짐
> - 가독성이 떨어짐
> - 연령대 높은 사용자에게 피로감

### 1-3. 카드 패턴 (Bento 핵심)

카드는 항상 이 구조를 유지:

```
[GROUP TAG]      [UPDATED TIME]

제목 (1~2줄, 굵게)

결론 요약 (2~3줄, 본문)
```

- 이미지 사용 안 함
- 아이콘 사용 안 함
- 대신 **타이포그래피 + 여백**으로 계층을 만든다

---

## 2. 타이포그래피 (Typography)

### 2-1. 기본 글꼴: Pretendard

프로젝트 전체에서 **Pretendard** 폰트를 사용한다.

#### CDN 로드 (`src/app.html`)

```html
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/npm/pretendard@latest/dist/web/static/pretendard.css" />
```

> **참고**: 운영 환경에서는 버전 고정 권장 (예: `@1.3.9`)

#### 폰트 스택 (`src/app.css`)

```css
:root {
  font-family: Pretendard, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR", Arial, sans-serif;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

#### 주의사항
- 컴포넌트에서 `font-family` 중복 지정 금지
- 모든 폰트 설정은 `app.css`의 `:root`에서 관리

---

## 3. 디자인 토큰 (Design Tokens)

### 3-1. CSS 변수 정의

`src/app.css`에 적용:

```css
:root {
  /* Color */
  --bg: #ffffff;
  --card-bg: #ffffff;
  --border: #eaeaea;

  --text-main: #111111;
  --text-body: #444444;
  --text-sub: #777777;

  /* Accent (딱 1개만) */
  --accent: #2563eb;

  /* Radius */
  --radius-card: 16px;

  /* Spacing */
  --space-xs: 6px;
  --space-sm: 10px;
  --space-md: 16px;
  --space-lg: 24px;
}
```

---

## 4. 컴포넌트 스타일 가이드

### 4-1. 카드 스타일

```css
.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: var(--space-lg);
  text-decoration: none;
  color: var(--text-main);
  display: block;
}

.card + .card {
  margin-top: var(--space-md);
}
```

### 4-2. 그룹 태그 (Bento 포인트)

```css
.tag {
  display: inline-block;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--accent);
  font-weight: 600;
}
```

### 4-3. 타이포그래피

```css
.card h3 {
  margin: var(--space-sm) 0;
  font-size: 18px;
  line-height: 1.4;
  font-weight: 700;
  color: var(--text-main);
}

.card p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-body);
}

.card .meta {
  font-size: 12px;
  color: var(--text-sub);
}
```

---

## 5. 절대 하지 말 것

- 그룹마다 다른 컬러 사용
- 그라디언트 사용
- 그림자 남용

---

## 6. Bento 감성 유지 규칙

| 규칙 | 설명 |
|------|------|
| 카드 = 항상 사각형 | 둥근 모서리는 OK, 원형/비정형 NO |
| radius는 통일 | 모든 카드에 동일한 `--radius-card` 적용 |
| 정렬은 좌측 기준 | 텍스트는 항상 왼쪽 정렬 |
| 시선 이동은 위 → 아래 | 수직 스크롤 기반 레이아웃 |

---

## 7. 디자인의 강점

- 이미지 없어도 완성도 높음
- 웹/앱 동일 UX
- 연령대 높은 사용자도 편함
- 뉴스가 아니라 브리핑/리포트 느낌

> **이 디자인은 "유행"이 아니라 "도구"에 가깝다. 그래서 오래 간다.**
