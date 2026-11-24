# Clean Brothers Portfolio

클린브라더스 청소 전후 포트폴리오 사이트입니다.

## 주요 기능

- 공개 페이지: before/after 비교 슬라이더, 서비스 범위, 대표 후기, 상담 링크
- 관리자 페이지: `/admin`에서 포트폴리오 이미지 2장과 대표 후기 게시
- 저장소: D1에 포트폴리오/후기 메타데이터 저장, R2에 업로드 이미지 저장
- 반응형 레이아웃: 모바일과 PC 모두 지원

## 실행

이 환경에는 npm이 없어 pnpm 기준으로 설치했습니다.

```bash
pnpm install
pnpm run dev
pnpm run build
```

## 관리자 코드

로컬 기본 관리자 코드는 `0215`입니다. 배포 운영 전에는
`ADMIN_PIN` 환경값을 반드시 변경하세요.

```bash
ADMIN_PIN=replace-with-a-private-admin-code
```

## 데이터 바인딩

`.openai/hosting.json`에 다음 바인딩이 선언되어 있습니다.

- `DB`: 포트폴리오와 후기 메타데이터용 D1
- `PORTFOLIO_IMAGES`: 업로드 이미지용 R2

스키마 변경 후에는 마이그레이션을 생성합니다.

```bash
pnpm run db:generate
```
