import type { Metadata } from "next";
import { Geist_Mono, Gothic_A1 } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const gothicA1 = Gothic_A1({
  variable: "--font-gothic-a1",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "클린브라더스 | 결과로 확인하는 전문 청소",
    description:
      "서울 강동구 클린브라더스의 작업 전후 포트폴리오와 청소 서비스를 확인하세요.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "클린브라더스 | 결과로 확인하는 전문 청소",
      description: "작업 전후 결과와 서비스 범위를 직접 확인하세요.",
      images: [{ url: imageUrl, width: 1734, height: 907 }],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "클린브라더스 | 결과로 확인하는 전문 청소",
      description: "작업 전후 결과와 서비스 범위를 직접 확인하세요.",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${gothicA1.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `document.currentScript.before(document.createComment(${JSON.stringify(
              "THESIS: 청소의 신뢰를 장식이 아니라 복원 과정과 실제 결과로 증명한다. 흔한 민트색 서비스 카드 랜딩을 거부한다.\nOWN-WORLD: 미네랄 그레이 바탕, 잉크 네이비, 단일 코발트 포인트, 촘촘한 작업 기록과 큰 비교 사진.\nSTORY: 결과를 본다. 범위와 방식을 이해한다. 실제 후기를 확인하고 전화 상담한다.\nFIRST VIEWPORT: 왼쪽에 두 줄 이하의 약속과 상담 행동, 오른쪽에 세로형 작업 비교 이미지가 화면의 대부분을 차지한다.\nFORM: 표면 복원 작업 기록, grounded direction 3, seed 3184c0cc.\nFINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md",
            )}));`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
