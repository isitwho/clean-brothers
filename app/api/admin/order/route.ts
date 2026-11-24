import { updateContentOrder, verifyAdminRequest } from "../../../../lib/content";

export async function PATCH(request: Request) {
  try {
    await verifyAdminRequest(request);
    const { kind, ids } = (await request.json()) as {
      kind?: "portfolio" | "review";
      ids?: string[];
    };
    await updateContentOrder(kind, ids);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "콘텐츠 순서 변경에 실패했습니다." },
      { status: 400 },
    );
  }
}
