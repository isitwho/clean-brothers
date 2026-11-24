import { database, type Database } from "./database";
import { del, head } from "@vercel/blob";

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
  sortOrder: number;
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
  sortOrder: number;
};

export type ReviewDisplaySettings = {
  featuredReviewId: string;
  randomReview: boolean;
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
  split_src: string;
  sort_order: number;
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
  sort_order: number;
  created_at: number;
};

type ReviewDisplayRow = {
  featured_review_id: string;
  random_review: number;
};

const runtimeEnv = { get DB() { return process.env.TURSO_DATABASE_URL ? database : undefined; }, get ADMIN_PIN() { return process.env.ADMIN_PIN; } };
const demoAdminPin = "0215";
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
    sortOrder: 0,
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
    sortOrder: 1,
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
    sortOrder: 2,
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
    sortOrder: 0,
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
    sortOrder: 1,
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
    sortOrder: 2,
  },
];

export async function listPortfolioItems() {
  const db = runtimeEnv.DB;
  if (!db) return seedPortfolio;

  try {
    await ensureSchema(db);
    const result = await db
      .prepare(
        `SELECT id, title, category, location, completed_at, summary, before_key, after_key, split_src, sort_order, created_at
         FROM portfolio_items
         ORDER BY sort_order ASC, created_at DESC
         LIMIT 30`,
      )
      .all<PortfolioRow>();

    return (result.results ?? []).map(toPortfolioItem);
  } catch {
    return seedPortfolio;
  }
}

export async function listReviews() {
  const { reviews, settings } = await listReviewsForAdmin();
  if (reviews.length < 2) return reviews;

  const selectedId = settings.randomReview
    ? reviews[Math.floor(Math.random() * reviews.length)]?.id
    : settings.featuredReviewId;
  const selectedIndex = reviews.findIndex((review) => review.id === selectedId);
  if (selectedIndex <= 0) return reviews;

  const selected = reviews[selectedIndex];
  return [selected, ...reviews.slice(0, selectedIndex), ...reviews.slice(selectedIndex + 1)];
}

export async function listReviewsForAdmin(): Promise<{
  reviews: ReviewItem[];
  settings: ReviewDisplaySettings;
}> {
  const db = runtimeEnv.DB;
  if (!db) return { reviews: seedReviews, settings: defaultReviewSettings };

  try {
    await ensureSchema(db);
    const result = await db
      .prepare(
        `SELECT id, author, rating, content, source, source_url, source_type, sort_order, created_at
         FROM reviews
         ORDER BY sort_order ASC, created_at DESC
         LIMIT 30`,
      )
      .all<ReviewRow>();

    const settings = await getReviewDisplaySettings(db);
    return {
      reviews: (result.results ?? []).map(toReviewItem),
      settings,
    };
  } catch {
    return { reviews: seedReviews, settings: defaultReviewSettings };
  }
}

export async function createPortfolioItem(formData: FormData) {
  const db = requireDb();
  await ensureSchema(db);

  const title = requireText(formData, "title");
  const category = requireText(formData, "category");
  const location = optionalText(formData, "location") || "서울 강동구";
  const completedAt =
    optionalText(formData, "completedAt") || new Date().toISOString().slice(0, 10);
  const summary = requireText(formData, "summary");
  const before = await imageUrl(formData, "before", true);
  const after = await imageUrl(formData, "after", true);
  const id = crypto.randomUUID();
  const beforeKey = before!;
  const afterKey = after!;
  const now = Date.now();

  await db.batch([
    db.prepare("UPDATE portfolio_items SET sort_order = sort_order + 1"),
    db.prepare(
      `INSERT INTO portfolio_items
       (id, title, category, location, completed_at, summary, before_key, after_key, split_src, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', 0, ?)`,
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
    ),
  ]);

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
    sortOrder: 0,
  };
}

export async function updatePortfolioItem(formData: FormData) {
  const db = requireDb();
  await ensureSchema(db);

  const id = requireText(formData, "id");
  const existing = await db
    .prepare("SELECT before_key, after_key, split_src, sort_order, created_at FROM portfolio_items WHERE id = ?")
    .bind(id)
    .first<{ before_key: string; after_key: string; split_src: string; sort_order: number; created_at: number }>();
  if (!existing) throw new Error("수정할 포트폴리오를 찾지 못했습니다.");

  const title = requireText(formData, "title");
  const category = requireText(formData, "category");
  const location = optionalText(formData, "location") || "서울 강동구";
  const completedAt = optionalText(formData, "completedAt") || new Date().toISOString().slice(0, 10);
  const summary = requireText(formData, "summary");
  const before = await imageUrl(formData, "before");
  const after = await imageUrl(formData, "after");
  if (existing.split_src && Boolean(before) !== Boolean(after)) {
    throw new Error("기본 비교 사진을 교체할 때는 작업 전/후 이미지를 모두 선택해 주세요.");
  }
  const beforeKey = before ? before : existing.before_key;
  const afterKey = after ? after : existing.after_key;
  const splitSrc = before && after ? "" : existing.split_src;

  await db.prepare(
    `UPDATE portfolio_items SET title = ?, category = ?, location = ?, completed_at = ?,
     summary = ?, before_key = ?, after_key = ?, split_src = ? WHERE id = ?`,
  ).bind(title, category, location, completedAt, summary, beforeKey, afterKey, splitSrc, id).run();

  if (before && existing.before_key !== beforeKey) await deleteImage(existing.before_key);
  if (after && existing.after_key !== afterKey) await deleteImage(existing.after_key);
  return toPortfolioItem({ id, title, category, location, completed_at: completedAt, summary, before_key: beforeKey, after_key: afterKey, split_src: splitSrc, sort_order: existing.sort_order, created_at: existing.created_at });
}

export async function deletePortfolioItem(idValue: unknown) {
  const id = cleanString(idValue);
  if (!id) throw new Error("삭제할 포트폴리오를 선택해 주세요.");
  const db = requireDb();
  await ensureSchema(db);
  const existing = await db.prepare("SELECT before_key, after_key FROM portfolio_items WHERE id = ?").bind(id).first<{ before_key: string; after_key: string }>();
  if (!existing) throw new Error("삭제할 포트폴리오를 찾지 못했습니다.");
  await db.prepare("DELETE FROM portfolio_items WHERE id = ?").bind(id).run();
  await Promise.all(
    [existing.before_key, existing.after_key]
      .filter(Boolean)
      .map((key) => deleteImage(key)),
  );
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
  await db.batch([
    db.prepare("UPDATE reviews SET sort_order = sort_order + 1"),
    db.prepare(
      `INSERT INTO reviews
       (id, author, rating, content, source, source_url, source_type, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    )
    .bind(id, author, rating, content, source, sourceUrl, sourceType, now),
  ]);

  return {
    id,
    author,
    rating,
    content,
    source,
    sourceUrl,
    sourceType,
    createdAt: new Date(now).toISOString(),
    sortOrder: 0,
  };
}

export async function updateContentOrder(kindValue: unknown, idsValue: unknown) {
  const kind = kindValue === "portfolio" || kindValue === "review" ? kindValue : "";
  const ids = Array.isArray(idsValue)
    ? idsValue.map(cleanString).filter(Boolean)
    : [];
  if (!kind || !ids.length || ids.length > 100 || new Set(ids).size !== ids.length) {
    throw new Error("변경할 콘텐츠 순서를 확인해 주세요.");
  }

  const db = requireDb();
  await ensureSchema(db);
  const table = kind === "portfolio" ? "portfolio_items" : "reviews";
  await db.batch(
    ids.map((id, index) => db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`).bind(index, id)),
  );
}

export async function updateReviewItem(payload: unknown) {
  const value = reviewPayload(payload, true);
  const db = requireDb();
  await ensureSchema(db);
  const result = await db.prepare(
    `UPDATE reviews SET author = ?, rating = ?, content = ?, source = ?, source_url = ?, source_type = ? WHERE id = ?`,
  ).bind(value.author, value.rating, value.content, value.source, value.sourceUrl, value.sourceType, value.id).run();
  if (!result.meta.changes) throw new Error("수정할 후기를 찾지 못했습니다.");
}

export async function deleteReviewItem(idValue: unknown) {
  const id = cleanString(idValue);
  if (!id) throw new Error("삭제할 후기를 선택해 주세요.");
  const db = requireDb();
  await ensureSchema(db);
  const result = await db.prepare("DELETE FROM reviews WHERE id = ?").bind(id).run();
  if (!result.meta.changes) throw new Error("삭제할 후기를 찾지 못했습니다.");
}

export async function updateReviewDisplaySettings(payload: unknown) {
  if (!payload || typeof payload !== "object") throw new Error("후기 표시 설정을 확인해 주세요.");
  const value = payload as Record<string, unknown>;
  const featuredReviewId = cleanString(value.featuredReviewId);
  const randomReview = value.randomReview === true;
  const db = requireDb();
  await ensureSchema(db);
  await db.prepare(
    `INSERT INTO site_settings (id, featured_review_id, random_review)
     VALUES ('review_display', ?, ?)
     ON CONFLICT(id) DO UPDATE SET featured_review_id = excluded.featured_review_id, random_review = excluded.random_review`,
  ).bind(featuredReviewId, randomReview ? 1 : 0).run();
  return { featuredReviewId, randomReview };
}


export async function verifyAdminRequest(request: Request) {
  const incomingPin = request.headers.get("x-admin-pin")?.trim() ?? "";
  const db = runtimeEnv.DB;

  if (db) {
    await ensureSchema(db);
    const saved = await db.prepare(
      "SELECT pin_hash, pin_salt FROM admin_settings WHERE id = 'primary'",
    ).first<{ pin_hash: string; pin_salt: string }>();
    if (saved) {
      const incomingHash = await hashAdminPin(incomingPin, saved.pin_salt);
      if (incomingHash === saved.pin_hash) return;
      throw new Error("관리자 코드가 올바르지 않습니다.");
    }
  }

  const configuredPin = cleanString(runtimeEnv.ADMIN_PIN) || (process.env.NODE_ENV === "production" ? "" : demoAdminPin);

  if (!configuredPin || incomingPin !== configuredPin) {
    throw new Error("관리자 코드가 올바르지 않습니다.");
  }
}

export async function updateAdminPin(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("새 관리자 코드를 확인해 주세요.");
  }
  const value = payload as Record<string, unknown>;
  const newPin = cleanString(value.newPin);
  const confirmPin = cleanString(value.confirmPin);
  if (!/^\d{4,20}$/.test(newPin)) {
    throw new Error("관리자 코드는 숫자 4~20자리로 입력해 주세요.");
  }
  if (newPin !== confirmPin) {
    throw new Error("새 관리자 코드가 서로 일치하지 않습니다.");
  }

  const db = requireDb();
  await ensureSchema(db);
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bytesToHex(saltBytes);
  const pinHash = await hashAdminPin(newPin, salt);
  await db.prepare(
    `INSERT INTO admin_settings (id, pin_hash, pin_salt, updated_at)
     VALUES ('primary', ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET pin_hash = excluded.pin_hash, pin_salt = excluded.pin_salt, updated_at = excluded.updated_at`,
  ).bind(pinHash, salt, Date.now()).run();
}

async function ensureSchema(db: Database) {
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
        split_src TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
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
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      )`,
    ),
    db.prepare(
      `CREATE INDEX IF NOT EXISTS reviews_created_at_idx
       ON reviews (created_at)`,
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        featured_review_id TEXT NOT NULL DEFAULT '',
        random_review INTEGER NOT NULL DEFAULT 0
      )`,
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS admin_settings (
        id TEXT PRIMARY KEY,
        pin_hash TEXT NOT NULL,
        pin_salt TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
    ),
  ]);

  await ensureColumn(db, "portfolio_items", "split_src", "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(db, "portfolio_items", "sort_order", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn(db, "reviews", "sort_order", "INTEGER NOT NULL DEFAULT 0");
  await ensureSeedContent(db);
}

async function ensureColumn(
  db: Database,
  table: "portfolio_items" | "reviews",
  column: string,
  definition: string,
) {
  const columns = await db.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  if ((columns.results ?? []).some((item) => item.name === column)) return;
  await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
}

async function ensureSeedContent(db: Database) {
  const seeded = await db.prepare(
    "SELECT id FROM site_settings WHERE id = 'seed_content_v1'",
  ).first<{ id: string }>();
  if (seeded) return;

  const portfolioCount = await db.prepare(
    "SELECT COUNT(*) AS count FROM portfolio_items",
  ).first<{ count: number }>();
  const reviewCount = await db.prepare(
    "SELECT COUNT(*) AS count FROM reviews",
  ).first<{ count: number }>();

  const portfolioOffset = Number(portfolioCount?.count ?? 0);
  const reviewOffset = Number(reviewCount?.count ?? 0);
  const statements = [
    ...seedPortfolio.map((item, index) => db.prepare(
      `INSERT OR IGNORE INTO portfolio_items
       (id, title, category, location, completed_at, summary, before_key, after_key, split_src, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, '', '', ?, ?, 0)`,
    ).bind(
      item.id,
      item.title,
      item.category,
      item.location,
      item.completedAt,
      item.summary,
      item.splitSrc ?? "",
      portfolioOffset + index,
    )),
    ...seedReviews.map((review, index) => db.prepare(
      `INSERT OR IGNORE INTO reviews
       (id, author, rating, content, source, source_url, source_type, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    ).bind(
      review.id,
      review.author,
      review.rating,
      review.content,
      review.source,
      review.sourceUrl ?? "",
      review.sourceType,
      reviewOffset + index,
    )),
    db.prepare(
      `INSERT OR IGNORE INTO site_settings (id, featured_review_id, random_review)
       VALUES ('seed_content_v1', '', 0)`,
    ),
  ];
  await db.batch(statements);
}

const defaultReviewSettings: ReviewDisplaySettings = {
  featuredReviewId: "seed-review-1",
  randomReview: false,
};

async function getReviewDisplaySettings(db: Database) {
  const row = await db.prepare(
    "SELECT featured_review_id, random_review FROM site_settings WHERE id = 'review_display'",
  ).first<ReviewDisplayRow>();
  return row
    ? { featuredReviewId: row.featured_review_id, randomReview: Boolean(row.random_review) }
    : defaultReviewSettings;
}

function requireDb() {
  if (!runtimeEnv.DB) {
    throw new Error("Turso 데이터베이스 연결이 필요합니다.");
  }
  return runtimeEnv.DB;
}


function toPortfolioItem(row: PortfolioRow): PortfolioItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    location: row.location,
    completedAt: row.completed_at,
    summary: row.summary,
    beforeSrc: row.before_key ? mediaPath(row.before_key) : undefined,
    afterSrc: row.after_key ? mediaPath(row.after_key) : undefined,
    splitSrc: row.split_src || undefined,
    source: row.id.startsWith("seed-") ? "seed" : "custom",
    sortOrder: row.sort_order,
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
    sortOrder: row.sort_order,
  };
}

async function hashAdminPin(pin: string, saltHex: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: 120_000,
      salt: hexToBytes(saltHex),
    },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(value: string) {
  if (!/^[0-9a-f]{32}$/i.test(value)) {
    throw new Error("저장된 관리자 코드 형식이 올바르지 않습니다.");
  }
  return Uint8Array.from(value.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16));
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

function reviewPayload(payload: unknown, requireId = false) {
  if (!payload || typeof payload !== "object") throw new Error("후기 내용을 확인해 주세요.");
  const value = payload as Record<string, unknown>;
  const id = cleanString(value.id);
  const author = cleanString(value.author);
  const content = cleanString(value.content);
  const rating = Number(value.rating);
  const source = cleanString(value.source) || "관리자 직접 게시";
  const sourceUrl = cleanString(value.sourceUrl);
  const sourceType = value.sourceType === "daangn" ? "daangn" as const : "manual" as const;
  if (requireId && !id) throw new Error("수정할 후기를 선택해 주세요.");
  if (!author) throw new Error("작성자를 입력해 주세요.");
  if (!content) throw new Error("후기 내용을 입력해 주세요.");
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) throw new Error("평점은 1점에서 5점 사이여야 합니다.");
  return { id, author, content, rating, source, sourceUrl, sourceType };
}

async function imageUrl(formData: FormData, key: string, required = false) {
  const value = cleanString(formData.get(key));
  if (!value && !required) return null;
  if (!value) throw new Error("작업 전/후 이미지를 모두 선택해 주세요.");
  const url = new URL(value);
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.split("_")[3]?.toLowerCase();
  if (!storeId || url.protocol !== "https:" || url.hostname !== storeId + ".public.blob.vercel-storage.com" || !url.pathname.startsWith("/portfolio/")) throw new Error("업로드한 이미지 경로가 올바르지 않습니다.");
  const file = await head(value);
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.contentType) || file.size > maxImageBytes) throw new Error("이미지 형식 또는 크기를 확인해 주세요.");
  return value;
}
async function deleteImage(url: string) {
  if (url.startsWith("https://")) await del(url);
}
function mediaPath(key: string) { return key; }
