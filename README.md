# 클린브라더스

Next.js 기반 청소 포트폴리오 사이트입니다. Vercel에서 프런트와 API를 함께 운영하고, Turso(libSQL)에 콘텐츠를, Vercel Blob에 사진을 저장합니다. 별도 DB 서버 운영은 필요하지 않습니다.

## 실행

pnpm install
pnpm dev
pnpm build

## Vercel 배포

1. Vercel에서 GitHub 저장소 isitwho/clean-brothers를 가져옵니다(프레임워크 Next.js).
2. Turso의 libSQL DB를 생성하고 TURSO_DATABASE_URL, TURSO_AUTH_TOKEN을 환경 변수로 등록합니다.
3. Vercel Storage에서 Public Blob 저장소를 연결합니다. BLOB_READ_WRITE_TOKEN이 등록됩니다.
4. ADMIN_PIN에 숫자 4~20자리의 운영 관리자 코드를 지정합니다. 운영 환경은 기본 코드로 로그인할 수 없습니다.
5. 배포하거나 pnpm deploy를 실행합니다.

DB 테이블과 기본 콘텐츠는 첫 연결 시 초기화됩니다. 로컬 테스트에는 TURSO_DATABASE_URL=file:local.db를 사용할 수 있습니다(운영 환경은 원격 DB 필수). 환경 변수가 없으면 공개 페이지는 기본 사례를 표시하며 관리자 저장은 동작하지 않습니다.

사진은 관리자 인증 후 브라우저에서 Blob으로 직접 업로드합니다(JPG/PNG/WebP, 각 10MB 이하). 서버 요청에는 이미지 URL만 전송됩니다.

기존 Cloudflare D1/R2의 데이터는 자동 이전되지 않습니다. 별도 내보내기 및 가져오기가 필요합니다. 업체 사이트의 상업적 운영은 Vercel 플랜 정책을 확인하세요.
