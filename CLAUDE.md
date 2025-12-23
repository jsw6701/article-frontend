# News Briefing Frontend - Claude Code Guide

## Project Overview
뉴스 브리핑 프론트엔드 앱 (SvelteKit 기반)

## Important References

### Design Guide
**반드시 참조**: `.claude/DESIGN_GUIDE.md`

이 프로젝트는 **Bento 디자인 패턴**을 따릅니다. UI 작업 시 반드시 디자인 가이드를 확인하세요.

#### 핵심 원칙 요약
1. 모든 정보는 '카드 블록' 안에만 존재
2. 여백이 곧 디자인
3. 색은 구분용이지 장식용이 아님
4. 이미지/아이콘 사용 안 함 - 타이포그래피 + 여백으로 계층 구성

#### 금지 사항
- 2열/3열 그리드 레이아웃
- 그룹별 다른 컬러
- 그라디언트
- 그림자 남용

## Tech Stack
- SvelteKit
- TypeScript

## Commands
```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 미리보기
```
