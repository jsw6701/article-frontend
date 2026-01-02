# SHIFT 디자인 가이드

## 디자인 철학

SHIFT는 **가독성 중심의 Apple iOS 스타일** 디자인을 따릅니다. 뉴스 콘텐츠를 장시간 읽어도 눈이 피로하지 않도록 최적화되어 있습니다.

### 핵심 원칙

1. **가독성 최우선** - 모든 디자인 결정은 텍스트 가독성을 기준으로
2. **콘텐츠 중심** - 장식보다 정보 전달에 집중
3. **일관된 시스템** - CSS 변수를 통한 통일된 디자인 언어
4. **접근성** - 충분한 대비, 적절한 크기, 명확한 계층

---

## 타이포그래피

### 폰트

```css
font-family: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

### 크기 가이드라인

| 용도 | 크기 | 비고 |
|------|------|------|
| 페이지 제목 | 28px | font-weight: 700, letter-spacing: -0.02em |
| 섹션 제목 | 20-22px | font-weight: 600-700 |
| 카드 제목 | 17-18px | font-weight: 600 |
| 본문 텍스트 | **17px (최소)** | iOS Human Interface 기준 |
| 보조 텍스트 | 15-16px | 설명, 메타 정보 |
| 라벨/캡션 | 13-14px | 카테고리, 태그 |

### 줄간격 (line-height)

- **본문/긴 텍스트**: 1.7 (가독성 최적)
- **제목**: 1.3-1.4
- **UI 요소**: 1.5

### 자간 (letter-spacing)

- **제목**: -0.02em (타이트하게)
- **본문**: -0.01em (약간 타이트)
- **라벨**: 0.03-0.05em (UPPERCASE일 경우)

---

## 색상 시스템

### 다크 테마 (기본값에서 변경됨: light가 기본)

```css
/* 배경 */
--bg: #000000;
--bg-elevated: #1c1c1e;
--bg-secondary: #2c2c2e;
--bg-tertiary: #3a3a3c;

/* 카드 */
--card: #1c1c1e;
--card-hover: #2c2c2e;

/* 텍스트 - 순수 흰색(#FFF) 대신 부드러운 오프화이트 사용 */
--text-primary: #F5F5F7;    /* 주요 텍스트 */
--text-secondary: #A1A1A6;  /* 보조 텍스트 */
--text-tertiary: #8E8E93;   /* 메타 정보 */
--text-quaternary: #636366; /* 비활성 */

/* 구분선 */
--separator: rgba(255, 255, 255, 0.15);
```

### 라이트 테마

```css
/* 배경 */
--bg: #F2F2F7;
--bg-elevated: #FFFFFF;
--bg-secondary: #F2F2F7;
--bg-tertiary: #E5E5EA;

/* 카드 */
--card: #FFFFFF;
--card-hover: #F2F2F7;

/* 텍스트 - 순수 검정(#000) 대신 부드러운 다크 그레이 사용 */
--text-primary: #1D1D1F;    /* 주요 텍스트 */
--text-secondary: #48484A;  /* 보조 텍스트 */
--text-tertiary: #6E6E73;   /* 메타 정보 */
--text-quaternary: #AEAEB2; /* 비활성 */

/* 구분선 */
--separator: rgba(0, 0, 0, 0.12);
```

### 시스템 색상

```css
--accent: #007AFF;       /* 파란색 - 주요 액션 */
--system-green: #34C759; /* 성공, 긍정적 */
--system-red: #FF3B30;   /* 에러, 부정적 */
--system-orange: #FF9500;
--system-yellow: #FFCC00;
--system-purple: #AF52DE;
--system-teal: #5AC8FA;
```

---

## 여백 시스템

```css
--space-1: 4px;   /* 최소 간격 */
--space-2: 8px;   /* 요소 내부 */
--space-3: 12px;  /* 관련 요소 간 */
--space-4: 16px;  /* 섹션 내부 */
--space-5: 24px;  /* 섹션 간 */
--space-6: 32px;  /* 큰 섹션 간 */
--space-7: 48px;  /* 페이지 레벨 */
```

### 패딩 가이드라인

- **카드/섹션 내부**: `var(--space-5)` (24px)
- **리스트 아이템**: `var(--space-4)` ~ `var(--space-5)`
- **입력 필드**: `var(--space-4)` (16px)
- **버튼**: `var(--space-3) var(--space-4)` ~ `var(--space-4) var(--space-5)`

---

## 모서리 둥글기

```css
--radius-sm: 8px;      /* 작은 요소 (태그, 뱃지) */
--radius: 12px;        /* 기본 (버튼, 입력) */
--radius-lg: 16px;     /* 카드, 섹션 */
--radius-xl: 20px;     /* 모달 */
--radius-full: 9999px; /* 원형 (아바타, 토글) */
```

---

## 컴포넌트 패턴

### 카드

```css
.card {
  background: var(--card);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}
```

### 리스트 아이템

```css
.list-item {
  padding: var(--space-4) var(--space-5);
  border-bottom: 0.5px solid var(--separator);
}

.list-item:last-child {
  border-bottom: none;
}
```

### 섹션 헤더

```css
.section h2 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-4);
}
```

### 버튼

```css
/* Primary */
.btn-primary {
  padding: var(--space-4);
  font-size: 17px;
  font-weight: 600;
  color: white;
  background: var(--accent);
  border-radius: var(--radius);
}

/* Secondary */
.btn-secondary {
  color: var(--accent);
  background: var(--bg-tertiary);
}
```

### 입력 필드

```css
.input {
  padding: var(--space-4);
  font-size: 17px;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: none;
  border-radius: var(--radius);
}

.input:focus {
  box-shadow: 0 0 0 4px var(--accent-glow);
}
```

---

## 텍스트 렌더링

### 문단 분리

긴 텍스트는 자동으로 문단 분리됩니다:
- 기존 줄바꿈(`\n`)이 있으면 유지
- 없으면 2-3문장씩 자동 그룹화

```css
.section p + p {
  margin-top: var(--space-4);
}
```

---

## 트랜지션

```css
--duration-fast: 0.15s;  /* 호버, 클릭 */
--duration: 0.25s;       /* 일반 전환 */
--duration-slow: 0.4s;   /* 모달, 페이지 */

--ease: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 금지 사항

1. **순수 검정/흰색 사용 금지**
   - `#000000`, `#FFFFFF` 대신 정의된 변수 사용
   - 장시간 읽기 시 눈의 피로 유발

2. **과도한 그림자 금지**
   - 필요한 곳에만 `--shadow-sm` 또는 `--shadow` 사용

3. **불필요한 보더 금지**
   - 구분이 필요하면 `--separator` 사용
   - 카드는 배경색으로 구분

4. **본문 17px 미만 금지**
   - 모바일에서 읽기 불편

5. **그라디언트 남용 금지**
   - 특별한 강조 외에는 단색 사용

---

## 반응형 고려사항

- **최대 너비**: 컨텐츠 영역 380-420px (모바일 최적화)
- **터치 타겟**: 최소 44x44px
- **여백**: 모바일에서 좌우 패딩 16-20px 유지

---

## 체크리스트

새 컴포넌트 작성 시 확인:

- [ ] 본문 텍스트 17px 이상인가?
- [ ] 줄간격 1.5 이상인가?
- [ ] CSS 변수를 사용하는가?
- [ ] 다크/라이트 테마 모두 확인했는가?
- [ ] 터치 타겟 44px 이상인가?
- [ ] 텍스트 대비가 충분한가?
