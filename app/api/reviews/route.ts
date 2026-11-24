import {
  createReviewItem,
  deleteReviewItem,
  listReviewsForAdmin,
  updateReviewDisplaySettings,
  updateReviewItem,
  verifyAdminRequest,
} from "../../../lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await listReviewsForAdmin());
}

export async function PUT(request: Request) {
  try {
    await verifyAdminRequest(request);
    await updateReviewItem(await request.json());
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    await verifyAdminRequest(request);
    const settings = await updateReviewDisplaySettings(await request.json());
    return Response.json({ settings });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    await verifyAdminRequest(request);
    const { id } = (await request.json()) as { id?: string };
    await deleteReviewItem(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdminRequest(request);
    const review = await createReviewItem(await request.json());
    return Response.json({ review }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
}
