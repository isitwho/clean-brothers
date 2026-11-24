import {
  createPortfolioItem,
  deletePortfolioItem,
  listPortfolioItems,
  updatePortfolioItem,
  verifyAdminRequest,
} from "../../../lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const portfolio = await listPortfolioItems();
  return Response.json({ portfolio });
}

export async function PUT(request: Request) {
  try {
    await verifyAdminRequest(request);
    const item = await updatePortfolioItem(await request.formData());
    return Response.json({ item });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    await verifyAdminRequest(request);
    const { id } = (await request.json()) as { id?: string };
    await deletePortfolioItem(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdminRequest(request);
    const item = await createPortfolioItem(await request.formData());
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
}
