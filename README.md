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

## Cloudflare 직접 배포

ChatGPT Sites와 독립적으로 Cloudflare Workers에 배포합니다.

1. `pnpm exec wrangler login`으로 배포 계정에 로그인합니다.
2. `pnpm exec wrangler d1 create clean-brothers-db`를 실행하고 반환된 database_id를 `wrangler.jsonc`의 자리표시자에 넣습니다.
3. `pnpm exec wrangler r2 bucket create clean-brothers-images`로 이미지 버킷을 만듭니다.
4. `pnpm run db:migrate:remote`로 스키마를 적용합니다.
5. `pnpm exec wrangler secret put ADMIN_PIN`으로 운영 관리자 코드를 설정합니다.
6. `pnpm run deploy`로 빌드하고 배포합니다.

D1과 R2는 새 계정에 생성되므로 기존 Sites의 게시물·이미지는 자동으로 이전되지 않습니다.
