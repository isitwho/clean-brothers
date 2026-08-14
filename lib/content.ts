import { env } from "cloudflare:workers";

export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  completedAt: string;
  summary: string;
  beforeSrc?: string;
  afterSrc?: string;
  splitSrc?: string;
  source: "seed" | "custom";
};

export type ReviewItem = {
  id: string;
  author: string;
  rating: number;
  content: string;
  source: string;
  sourceUrl?: string;
  sourceType: "manual" | "daangn";
  createdAt: string;
};

type RuntimeEnv = {
  DB?: D1Database;
  PORTFOLIO_IMAGES?: R2Bucket;
  ADMIN_PIN?: string;
};

type PortfolioRow = {
  id: string;
  title: string;
  category: string;
  location: string;
  completed_at: string;
  summary: string;
  before_key: string;
  after_key: string;
  created_at: number;
};

type ReviewRow = {
  id: string;
  author: string;
  rating: number;
  content: string;
  source: string;
  source_url: string;
  source_type: "manual" | "daangn";
  created_at: number;
};

const runtimeEnv = env as unknown as RuntimeEnv;
const demoAdminPin = "cleanbrothers2026";
const maxImageBytes = 10 * 1024 * 1024;

export const seedPortfolio: PortfolioItem[] = [
  {
    id: "seed-bathroom",
    title: "강동구 천호동 욕실 디테일 청소",
    category: "화장실 청소",
    location: "서울 강동구 천호동",
    completedAt: "대표 사례",
    splitSrc: "/assets/portfolio-bathroom.png",
    summary: "물때, 유리 얼룩, 타일 오염을 장비와 약품으로 단계별 제거",
    source: "seed",
  },
  {
    id: "seed-aircon",
    title: "벽걸이 에어컨 분해 세척",
    category: "에어컨 청소",
    location: "서울 강동구",
    completedAt: "대표 사례",
    splitSrc: "/assets/portfolio-aircon.png",
    summary: "송풍구 먼지와 곰팡이 흔적을 분해 세척으로 정리",
    source: "seed",
  },
  {
    id: "seed-kitchen",
    title: "주방 후드 및 상판 집중 케어",
    category: "주방/후드 청소",
    location: "서울 강동구",
    completedAt: "대표 사례",
    splitSrc: "/assets/portfolio-kitchen.png",
    summary: "후드 필터 기름때와 타일 오염을 집중 제거",
    source: "seed",
  },
];

export const seedReviews: ReviewItem[] = [
  {
    id: "seed-review-1",
    author: "천호동 고객",
    rating: 5,
    source: "관리자 직접 게시",
    sourceType: "manual",
    createdAt: "대표 후기",
    content:
      "상담부터 검수까지 설명이 명확했고, 화장실 물때가 정말 눈에 띄게 사라졌습니다.",
  },
  {
    id: "seed-review-2",
    author: "입주청소 고객",
    rating: 5,
    source: "관리자 직접 게시",
    sourceType: "manual",
    createdAt: "대표 후기",
    content:
      "구석 먼지와 창틀까지 꼼꼼했습니다. 결제 전 같이 확인하는 방식도 믿음이 갔어요.",
  },
  {
    id: "seed-review-3",
    author: "단골 고객",
    rating: 4.9,
    source: "관리자 직접 게시",
    sourceType: "manual",
    createdAt: "대표 후기",
    content:
      "에어컨 냄새가 줄고 바람이 훨씬 산뜻해졌습니다. 다음 청소도 맡길 예정입니다.",
  },
];

export async function listPortfolioItems() {
  const db = runtimeEnv.DB;
  if (!db) return seedPortfolio;

  try {
    await ensureSchema(db);
    const result = await db
      .prepare(
        `SELECT id, title, category, location, completed_at, summary, before_key, after_key, created_at
         FROM portfolio_items
         ORDER BY created_at DESC
         LIMIT 30`,
      )
      .all<PortfolioRow>();

    return [...(result.results ?? []).map(toPortfolioItem), ...seedPortfolio];
  } catch {
    return seedPortfolio;
  }
}

export async function listReviews() {
  const db = runtimeEnv.DB;
  if (!db) return seedReviews;

  try {
    await ensureSchema(db);
    const result = await db
      .prepare(
        `SELECT id, author, rating, content, source, source_url, source_type, created_at
         FROM reviews
         ORDER BY created_at DESC
         LIMIT 30`,
      )
      .all<ReviewRow>();

    return [...(result.results ?? []).map(toReviewItem), ...seedReviews];
  } catch {
    return seedReviews;
  }
}

export async function createPortfolioItem(formData: FormData) {
  const db = requireDb();
  const bucket = requireBucket();
  await ensureSchema(db);

  const title = requireText(formData, "title");
  const category = requireText(formData, "category");
  const location = optionalText(formData, "location") || "서울 강동구";
  const completedAt =
    optionalText(formData, "completedAt") || new Date().toISOString().slice(0, 10);
  const summary = requireText(formData, "summary");
  const before = requireImage(formData, "before");
  const after = requireImage(formData, "after");
  const id = crypto.randomUUID();
  const beforeKey = await putImage(bucket, before, `${id}-before`);
  const afterKey = await putImage(bucket, after, `${id}-after`);
  const now = Date.now();

  await db
    .prepare(
      `INSERT INTO portfolio_items
       (id, title, category, location, completed_at, summary, before_key, after_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      title,
      category,
      location,
      completedAt,
      summary,
      beforeKey,
      afterKey,
      now,
    )
    .run();

  return {
    id,
    title,
    category,
    location,
    completedAt,
    summary,
    beforeSrc: mediaPath(beforeKey),
    afterSrc: mediaPath(afterKey),
    source: "custom" as const,
  };
}

export async function createReviewItem(payload: unknown) {
  const db = requireDb();
  await ensureSchema(db);

  if (!payload || typeof payload !== "object") {
    throw new Error("후기 내용을 확인해 주세요.");
  }

  const value = payload as Record<string, unknown>;
  const author = cleanString(value.author);
  const content = cleanString(value.content);
  const rating = Number(value.rating);
  const source = cleanString(value.source) || "관리자 직접 게시";
  const sourceUrl = cleanString(value.sourceUrl);
  const sourceType = value.sourceType === "daangn" ? "daangn" : "manual";

  if (!author) throw new Error("작성자를 입력해 주세요.");
  if (!content) throw new Error("후기 내용을 입력해 주세요.");
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error("평점은 1점에서 5점 사이여야 합니다.");
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO reviews
       (id, author, rating, content, source, source_url, source_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, author, rating, content, source, sourceUrl, sourceType, now)
    .run();

  return {
    id,
    author,
    rating,
    content,
    source,
    sourceUrl,
    sourceType,
    createdAt: new Date(now).toISOString(),
  };
}

export async function getMedia(key: string) {
  const safeKey = key.replace(/^\/+/, "");
  if (!safeKey || safeKey.includes("..")) {
    throw new Error("이미지 경로를 확인해 주세요.");
  }

  const object = await requireBucket().get(safeKey);
  if (!object) return null;
  return object;
}

export function verifyAdminRequest(request: Request) {
  const configuredPin = cleanString(runtimeEnv.ADMIN_PIN) || demoAdminPin;
  const incomingPin = request.headers.get("x-admin-pin")?.trim() ?? "";

  if (incomingPin !== configuredPin) {
    throw new Error("관리자 코드가 올바르지 않습니다.");
  }
}

async function ensureSchema(db: D1Database) {
  await db.batch([
    db.prepare(
      `CREATE TABLE IF NOT EXISTS portfolio_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        summary TEXT NOT NULL,
        before_key TEXT NOT NULL,
        after_key TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`,
    ),
    db.prepare(
      `CREATE INDEX IF NOT EXISTS portfolio_items_created_at_idx
       ON portfolio_items (created_at)`,
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        rating REAL NOT NULL,
        content TEXT NOT NULL,
        source TEXT NOT NULL,
        source_url TEXT NOT NULL DEFAULT '',
        source_type TEXT NOT NULL DEFAULT 'manual',
        created_at INTEGER NOT NULL
      )`,
    ),
    db.prepare(
      `CREATE INDEX IF NOT EXISTS reviews_created_at_idx
       ON reviews (created_at)`,
    ),
  ]);
}

function requireDb() {
  if (!runtimeEnv.DB) {
    throw new Error("D1 데이터베이스 바인딩이 필요합니다.");
  }
  return runtimeEnv.DB;
}

function requireBucket() {
  if (!runtimeEnv.PORTFOLIO_IMAGES) {
    throw new Error("R2 이미지 저장소 바인딩이 필요합니다.");
  }
  return runtimeEnv.PORTFOLIO_IMAGES;
}

function toPortfolioItem(row: PortfolioRow): PortfolioItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    location: row.location,
    completedAt: row.completed_at,
    summary: row.summary,
    beforeSrc: mediaPath(row.before_key),
    afterSrc: mediaPath(row.after_key),
    source: "custom",
  };
}

function toReviewItem(row: ReviewRow): ReviewItem {
  return {
    id: row.id,
    author: row.author,
    rating: row.rating,
    content: row.content,
    source: row.source,
    sourceUrl: row.source_url,
    sourceType: row.source_type,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function putImage(bucket: R2Bucket, file: File, stem: string) {
  const extension = extensionFor(file.type);
  const key = `portfolio/${stem}.${extension}`;
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  return key;
}

function requireText(formData: FormData, key: string) {
  const value = optionalText(formData, key);
  if (!value) throw new Error("필수 입력값을 확인해 주세요.");
  return value;
}

function optionalText(formData: FormData, key: string) {
  return cleanString(formData.get(key));
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function requireImage(formData: FormData, key: string) {
  const value = formData.get(key);
  if (!(value instanceof File) || value.size === 0) {
    throw new Error("작업 전/후 이미지를 모두 선택해 주세요.");
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(value.type)) {
    throw new Error("이미지는 JPG, PNG, WebP만 업로드할 수 있습니다.");
  }
  if (value.size > maxImageBytes) {
    throw new Error("이미지는 10MB 이하로 업로드해 주세요.");
  }
  return value;
}

function extensionFor(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

function mediaPath(key: string) {
  return `/api/media/${key}`;
}
