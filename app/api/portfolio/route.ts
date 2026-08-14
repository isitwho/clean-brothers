import {
  createPortfolioItem,
  listPortfolioItems,
  verifyAdminRequest,
} from "../../../lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const portfolio = await listPortfolioItems();
  return Response.json({ portfolio });
}

export async function POST(request: Request) {
  try {
    verifyAdminRequest(request);
    const item = await createPortfolioItem(await request.formData());
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
}
