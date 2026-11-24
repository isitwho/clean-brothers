import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { verifyAdminRequest } from "../../../lib/content";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody;
    const result = await handleUpload({ request, body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { pin } = JSON.parse(clientPayload || "{}");
        await verifyAdminRequest(new Request(request.url, { headers: { "x-admin-pin": typeof pin === "string" ? pin : "" } }));
        if (!/^portfolio\/[a-f0-9-]+\.(jpg|png|webp)$/.test(pathname)) throw new Error("잘못된 업로드 경로입니다.");
        return { allowedContentTypes: ["image/jpeg", "image/png", "image/webp"], maximumSizeInBytes: 10 * 1024 * 1024, addRandomSuffix: true };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(result);
  } catch { return Response.json({ error: "업로드 권한과 이미지 파일을 확인해 주세요." }, { status: 400 }); }
}
