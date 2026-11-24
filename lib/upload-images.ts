"use client";
import { upload } from "@vercel/blob/client";
export async function uploadPortfolioImages(body: FormData, pin: string) {
  for (const key of ["before", "after"]) {
    const file = body.get(key);
    if (!(file instanceof File) || !file.size) continue;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error("이미지는 JPG, PNG, WebP 10MB 이하로 선택해 주세요.");
    const blob = await upload("portfolio/" + crypto.randomUUID() + "." + (file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"), file, {
      access: "public", handleUploadUrl: "/api/uploads", clientPayload: JSON.stringify({ pin }), contentType: file.type,
    });
    body.set(key, blob.url);
  }
}
