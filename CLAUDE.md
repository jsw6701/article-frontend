# SHIFT Frontend - Claude Code Guide

## Project Overview
SHIFT - 뉴스 브리핑 프론트엔드 앱 (SvelteKit 기반)

## Design System

### Design Guide
**반드시 참조**: `.claude/DESIGN_GUIDE.md`

이 프로젝트는 **가독성 중심 Apple iOS 스타일** 디자인을 따릅니다.

#### 핵심 원칙
1. **가독성 최우선** - 뉴스/텍스트 콘텐츠 장시간 읽기에 최적화
2. **iOS Human Interface Guidelines 준수** - 17px 본문, 1.5+ 줄간격
3. **CSS 변수 시스템** - 모든 스타일은 변수로 통일
4. **다크/라이트 테마** - 기본값: 라이트 테마

#### 필수 규칙
- 본문 텍스트: **최소 17px**
- 줄간격: **1.5 이상** (긴 텍스트는 1.7)
- 순수 검정(`#000`)/흰색(`#FFF`) 사용 금지 → 정의된 변수 사용
- 폰트: Pretendard Variable

#### 색상 변수
```css
/* 텍스트 */
--text-primary    /* 주요 텍스트 */
--text-secondary  /* 보조 텍스트 */
--text-tertiary   /* 메타 정보 */

/* 배경 */
--bg              /* 페이지 배경 */
--card            /* 카드 배경 */

/* 시스템 */
--accent          /* 주요 액션 (파란색) */
--system-green    /* 긍정적 */
--system-red      /* 부정적 */
```

## Tech Stack
- SvelteKit
- TypeScript
- Capacitor (Android/iOS)

## Commands
```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 미리보기
npm run build:android # Android 빌드
```

## Project Structure
```
src/
├── routes/          # 페이지 컴포넌트
│   ├── +page.svelte       # 홈 (뉴스 피드)
│   ├── cards/[issueId]/   # 카드 상세
│   ├── trending/          # 트렌딩
│   ├── bookmarks/         # 북마크
│   ├── mypage/            # 마이페이지
│   └── admin/             # 관리자
├── lib/
│   ├── api.ts             # API 클라이언트
│   ├── stores/            # Svelte 스토어
│   │   ├── auth.ts        # 인증 상태
│   │   └── settings.ts    # 사용자 설정 (테마 등)
│   ├── components/        # 공통 컴포넌트
│   └── utils/             # 유틸리티
└── app.css          # 전역 스타일 & CSS 변수
```
