import {
  createReviewItem,
  listReviews,
  verifyAdminRequest,
} from "../../../lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const reviews = await listReviews();
  return Response.json({ reviews });
}

export async function POST(request: Request) {
  try {
    verifyAdminRequest(request);
    const review = await createReviewItem(await request.json());
    return Response.json({ review }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
}
