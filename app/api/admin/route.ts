import { updateAdminPin, verifyAdminRequest } from "../../../lib/content";

export async function POST(request: Request) {
  try {
    await verifyAdminRequest(request);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "관리자 인증에 실패했습니다." },
      { status: 401 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await verifyAdminRequest(request);
    await updateAdminPin(await request.json());
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "관리자 코드 변경에 실패했습니다." },
      { status: 400 },
    );
  }
}
