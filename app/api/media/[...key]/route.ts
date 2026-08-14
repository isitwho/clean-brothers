import { getMedia } from "../../../../lib/content";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  try {
    const { key } = await context.params;
    const object = await getMedia(key.join("/"));
    if (!object) return new Response("Not found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=31536000, immutable");

    return new Response(object.body, { headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "이미지를 불러오지 못했습니다.";
    return Response.json({ error: message }, { status: 400 });
  }
}
