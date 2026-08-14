"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

type PortfolioItem = {
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

type ReviewItem = {
  id: string;
  author: string;
  rating: number;
  content: string;
  source: string;
  sourceUrl?: string;
  sourceType: "manual" | "daangn";
  createdAt: string;
};

const defaultPortfolio = {
  title: "",
  category: "입주/이사 청소",
  location: "서울 강동구",
  completedAt: "",
  summary: "",
};

const defaultReview = {
  author: "",
  rating: "5",
  source: "관리자 직접 게시",
  sourceUrl: "",
  content: "",
};

export function AdminDashboard() {
  const [pin, setPin] = useState("");
  const [portfolioForm, setPortfolioForm] = useState(defaultPortfolio);
  const [reviewForm, setReviewForm] = useState(defaultReview);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [message, setMessage] = useState("관리자 코드를 입력하면 게시할 수 있습니다.");
  const [isSaving, setIsSaving] = useState(false);

  const beforePreview = useObjectUrl(beforeFile);
  const afterPreview = useObjectUrl(afterFile);

  async function loadContent() {
    const [portfolioResponse, reviewsResponse] = await Promise.all([
      fetch("/api/portfolio", { cache: "no-store" }),
      fetch("/api/reviews", { cache: "no-store" }),
    ]);
    if (portfolioResponse.ok) {
      const data = (await portfolioResponse.json()) as {
        portfolio: PortfolioItem[];
      };
      setPortfolio(data.portfolio);
    }
    if (reviewsResponse.ok) {
      const data = (await reviewsResponse.json()) as { reviews: ReviewItem[] };
      setReviews(data.reviews);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContent();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function submitPortfolio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!beforeFile || !afterFile) {
      setMessage("작업 전/후 이미지를 모두 선택해 주세요.");
      return;
    }

    const body = new FormData();
    Object.entries(portfolioForm).forEach(([key, value]) => body.set(key, value));
    body.set("before", beforeFile);
    body.set("after", afterFile);

    setIsSaving(true);
    setMessage("포트폴리오를 저장하는 중입니다.");
    const response = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "x-admin-pin": pin },
      body,
    });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setMessage(data.error ?? "포트폴리오 저장에 실패했습니다.");
      return;
    }

    setPortfolioForm(defaultPortfolio);
    setBeforeFile(null);
    setAfterFile(null);
    setMessage("포트폴리오가 게시되었습니다.");
    await loadContent();
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("후기를 저장하는 중입니다.");
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-pin": pin,
      },
      body: JSON.stringify({
        ...reviewForm,
        rating: Number(reviewForm.rating),
        sourceType: reviewForm.source.includes("당근") ? "daangn" : "manual",
      }),
    });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setMessage(data.error ?? "후기 저장에 실패했습니다.");
      return;
    }

    setReviewForm(defaultReview);
    setMessage("후기가 게시되었습니다.");
    await loadContent();
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="brand-mark" aria-label="클린브라더스 홈">
          CB
        </Link>
        <div>
          <p className="eyebrow">Clean Brothers Admin</p>
          <h1>게시 관리</h1>
        </div>
        <Link className="secondary-button" href="/">
          사이트 보기
        </Link>
      </header>

      <section className="admin-status">
        <label>
          관리자 코드
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            type="password"
            placeholder="운영 코드 입력"
            autoComplete="current-password"
          />
        </label>
        <p>{message}</p>
      </section>

      <div className="admin-grid">
        <section className="admin-panel">
          <div className="admin-panel__heading">
            <p className="eyebrow">Portfolio</p>
            <h2>전후 사진 게시</h2>
          </div>
          <form className="admin-form" onSubmit={submitPortfolio}>
            <label>
              제목
              <input
                required
                value={portfolioForm.title}
                onChange={(event) =>
                  setPortfolioForm({ ...portfolioForm, title: event.target.value })
                }
                placeholder="예: 둔촌동 입주청소 욕실 케어"
              />
            </label>
            <div className="admin-form__row">
              <label>
                카테고리
                <select
                  value={portfolioForm.category}
                  onChange={(event) =>
                    setPortfolioForm({
                      ...portfolioForm,
                      category: event.target.value,
                    })
                  }
                >
                  <option>입주/이사 청소</option>
                  <option>거주 청소</option>
                  <option>에어컨 청소</option>
                  <option>화장실 청소</option>
                  <option>주방/후드 청소</option>
                  <option>곰팡이 제거</option>
                  <option>사무실 청소</option>
                </select>
              </label>
              <label>
                지역
                <input
                  value={portfolioForm.location}
                  onChange={(event) =>
                    setPortfolioForm({
                      ...portfolioForm,
                      location: event.target.value,
                    })
                  }
                />
              </label>
            </div>
            <label>
              작업일
              <input
                value={portfolioForm.completedAt}
                onChange={(event) =>
                  setPortfolioForm({
                    ...portfolioForm,
                    completedAt: event.target.value,
                  })
                }
                type="date"
              />
            </label>
            <label>
              설명
              <textarea
                required
                rows={4}
                value={portfolioForm.summary}
                onChange={(event) =>
                  setPortfolioForm({
                    ...portfolioForm,
                    summary: event.target.value,
                  })
                }
                placeholder="오염 상태와 작업 결과를 간단히 남겨 주세요."
              />
            </label>
            <div className="admin-form__row">
              <FileInput label="작업 전" onChange={setBeforeFile} />
              <FileInput label="작업 후" onChange={setAfterFile} />
            </div>
            {beforePreview && afterPreview ? (
              <BeforeAfterSlider
                title={portfolioForm.title || "새 포트폴리오"}
                beforeSrc={beforePreview}
                afterSrc={afterPreview}
              />
            ) : null}
            <button className="primary-button" disabled={isSaving} type="submit">
              포트폴리오 게시
            </button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__heading">
            <p className="eyebrow">Reviews</p>
            <h2>대표 후기 게시</h2>
          </div>
          <form className="admin-form" onSubmit={submitReview}>
            <div className="admin-form__row">
              <label>
                작성자
                <input
                  required
                  value={reviewForm.author}
                  onChange={(event) =>
                    setReviewForm({ ...reviewForm, author: event.target.value })
                  }
                  placeholder="예: 당근 고객"
                />
              </label>
              <label>
                평점
                <select
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm({ ...reviewForm, rating: event.target.value })
                  }
                >
                  <option value="5">5.0</option>
                  <option value="4.5">4.5</option>
                  <option value="4">4.0</option>
                </select>
              </label>
            </div>
            <label>
              출처
              <input
                value={reviewForm.source}
                onChange={(event) =>
                  setReviewForm({ ...reviewForm, source: event.target.value })
                }
                placeholder="예: 당근 후기, 관리자 직접 게시"
              />
            </label>
            <label>
              출처 링크
              <input
                value={reviewForm.sourceUrl}
                onChange={(event) =>
                  setReviewForm({ ...reviewForm, sourceUrl: event.target.value })
                }
                placeholder="선택 사항"
              />
            </label>
            <label>
              후기 내용
              <textarea
                required
                rows={5}
                value={reviewForm.content}
                onChange={(event) =>
                  setReviewForm({ ...reviewForm, content: event.target.value })
                }
                placeholder="대표 후기를 입력해 주세요."
              />
            </label>
            <button className="primary-button" disabled={isSaving} type="submit">
              후기 게시
            </button>
          </form>
        </section>
      </div>

      <section className="admin-panel admin-panel--wide">
        <div className="admin-panel__heading">
          <p className="eyebrow">Published</p>
          <h2>게시된 콘텐츠</h2>
        </div>
        <div className="admin-list">
          {portfolio.map((item) => (
            <article key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.category}</span>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
        <div className="admin-list admin-list--reviews">
          {reviews.map((review) => (
            <article key={review.id}>
              <strong>
                {review.author} · {review.rating.toFixed(1)}
              </strong>
              <span>{review.source}</span>
              <p>{review.content}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function FileInput({
  label,
  onChange,
}: {
  label: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label>
      {label}
      <input
        required
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function useObjectUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}
