"use client";
import { uploadPortfolioImages } from "../lib/upload-images";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { AdminContentManager, type PortfolioItem, type ReviewItem, type ReviewSettings } from "./AdminContentManager";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

const categories = [
  "입주/이사 청소", "거주 청소", "에어컨 청소", "화장실 청소",
  "주방/후드 청소", "곰팡이 제거", "사무실 청소", "냉장고 청소",
];
const customCategoryValue = "__custom__";
const defaultPortfolio = { title: "", location: "서울 강동구", completedAt: "", summary: "" };
const defaultReview = { author: "", rating: "5", source: "관리자 직접 게시", sourceUrl: "", content: "" };

export function AdminDashboard() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState(defaultPortfolio);
  const [categoryChoice, setCategoryChoice] = useState(categories[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [reviewForm, setReviewForm] = useState(defaultReview);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({ featuredReviewId: "seed-review-1", randomReview: false });
  const [message, setMessage] = useState("관리자 코드를 입력해 주세요.");
  const [isSaving, setIsSaving] = useState(false);
  const [pinForm, setPinForm] = useState({ newPin: "", confirmPin: "" });

  const beforePreview = useObjectUrl(beforeFile);
  const afterPreview = useObjectUrl(afterFile);

  async function loadContent() {
    const [portfolioResponse, reviewsResponse] = await Promise.all([
      fetch("/api/portfolio", { cache: "no-store" }),
      fetch("/api/reviews", { cache: "no-store" }),
    ]);
    if (portfolioResponse.ok) {
      const data = (await portfolioResponse.json()) as { portfolio: PortfolioItem[] };
      setPortfolio(data.portfolio);
    }
    if (reviewsResponse.ok) {
      const data = (await reviewsResponse.json()) as { reviews: ReviewItem[]; settings: ReviewSettings };
      setReviews(data.reviews);
      setReviewSettings(data.settings);
    }
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("관리자 코드를 확인하는 중입니다.");
    const response = await fetch("/api/admin", { method: "POST", headers: { "x-admin-pin": pin } });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);
    if (!response.ok) {
      setMessage(data.error ?? "관리자 인증에 실패했습니다.");
      return;
    }
    setIsAuthenticated(true);
    setMessage("인증되었습니다. 콘텐츠를 관리할 수 있습니다.");
    await loadContent();
  }

  async function submitPortfolio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!beforeFile || !afterFile) {
      setMessage("새 포트폴리오에는 작업 전/후 이미지가 모두 필요합니다.");
      return;
    }
    const category = categoryChoice === customCategoryValue ? customCategory.trim() : categoryChoice;
    if (!category) {
      setMessage("직접 입력할 카테고리 이름을 적어 주세요.");
      return;
    }
    const body = new FormData();
    Object.entries(portfolioForm).forEach(([key, value]) => body.set(key, value));
    body.set("category", category);
    body.set("before", beforeFile);
    body.set("after", afterFile);

    setIsSaving(true);
    setMessage("포트폴리오를 게시하는 중입니다.");
    try { await uploadPortfolioImages(body, pin); }
    catch (error) { setIsSaving(false); setMessage(error instanceof Error ? error.message : "사진 업로드에 실패했습니다."); return ; }
    const response = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "x-admin-pin": pin }, body,
    });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);
    if (!response.ok) {
      setMessage(data.error ?? "포트폴리오 저장에 실패했습니다.");
      return;
    }
    resetPortfolioForm();
    setMessage("포트폴리오가 게시되었습니다.");
    await loadContent();
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("후기를 게시하는 중입니다.");
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({
        ...reviewForm, rating: Number(reviewForm.rating),
        sourceType: reviewForm.source.includes("당근") ? "daangn" : "manual",
      }),
    });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);
    if (!response.ok) {
      setMessage(data.error ?? "후기 저장에 실패했습니다.");
      return;
    }
    resetReviewForm();
    setMessage("후기가 게시되었습니다.");
    await loadContent();
  }

  async function changeAdminPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("관리자 코드를 변경하는 중입니다.");
    const response = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify(pinForm),
    });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);
    if (!response.ok) {
      setMessage(data.error ?? "관리자 코드 변경에 실패했습니다.");
      return;
    }
    setPin(pinForm.newPin);
    setPinForm({ newPin: "", confirmPin: "" });
    setMessage("관리자 코드가 변경되었습니다. 다음 로그인부터 새 코드를 사용하세요.");
  }

  function resetPortfolioForm() {
    setPortfolioForm(defaultPortfolio);
    setCategoryChoice(categories[0]);
    setCustomCategory("");
    setBeforeFile(null);
    setAfterFile(null);
    setFileKey((value) => value + 1);
  }

  function resetReviewForm() {
    setReviewForm(defaultReview);
  }

  if (!isAuthenticated) {
    return (
      <main className="admin-login-shell">
        <section className="admin-login-panel">
          <Link href="/" className="brand-mark" aria-label="클린브라더스 홈">클린브라더스</Link>
          <div>
            <h1>관리자 확인</h1>
            <p>게시 관리 페이지는 운영 코드 확인 후 사용할 수 있습니다.</p>
          </div>
          <form className="admin-form" onSubmit={submitLogin}>
            <label>관리자 코드
              <input autoFocus required value={pin} onChange={(event) => setPin(event.target.value)} type="password" placeholder="운영 코드 입력" autoComplete="current-password" />
            </label>
            <button className="primary-button" disabled={isSaving} type="submit">관리 페이지 들어가기</button>
          </form>
          <p className="admin-message" role="status">{message}</p>
          <Link className="admin-back-link" href="/">사이트로 돌아가기</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="brand-mark" aria-label="클린브라더스 홈">CB</Link>
        <div><h1>게시 관리</h1></div>
        <Link className="secondary-button" href="/">사이트 보기</Link>
      </header>

      <section className="admin-status"><p role="status">{message}</p></section>

      <div className="admin-grid">
        <section className="admin-panel" id="portfolio-form">
          <div className="admin-panel__heading"><h2>전후 사진 게시</h2></div>
          <form className="admin-form" onSubmit={submitPortfolio}>
            <label>제목<input required value={portfolioForm.title} onChange={(event) => setPortfolioForm({ ...portfolioForm, title: event.target.value })} placeholder="예: 둔촌동 입주청소 욕실 케어" /></label>
            <div className="admin-form__row">
              <label>카테고리
                <select value={categoryChoice} onChange={(event) => setCategoryChoice(event.target.value)}>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                  <option value={customCategoryValue}>직접 입력</option>
                </select>
              </label>
              {categoryChoice === customCategoryValue ? (
                <label>카테고리 이름<input required value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} placeholder="예: 베란다 집중 청소" /></label>
              ) : (
                <label>지역<input value={portfolioForm.location} onChange={(event) => setPortfolioForm({ ...portfolioForm, location: event.target.value })} /></label>
              )}
            </div>
            {categoryChoice === customCategoryValue ? <label>지역<input value={portfolioForm.location} onChange={(event) => setPortfolioForm({ ...portfolioForm, location: event.target.value })} /></label> : null}
            <label>작업일<input value={portfolioForm.completedAt} onChange={(event) => setPortfolioForm({ ...portfolioForm, completedAt: event.target.value })} type="date" /></label>
            <label>설명<textarea required rows={4} value={portfolioForm.summary} onChange={(event) => setPortfolioForm({ ...portfolioForm, summary: event.target.value })} placeholder="오염 상태와 작업 결과를 간단히 남겨 주세요." /></label>
            <div className="admin-form__row" key={fileKey}>
              <FileInput label="작업 전" required onChange={setBeforeFile} />
              <FileInput label="작업 후" required onChange={setAfterFile} />
            </div>
            {beforePreview && afterPreview ? <BeforeAfterSlider title={portfolioForm.title || "새 포트폴리오"} beforeSrc={beforePreview} afterSrc={afterPreview} /> : null}
            <div className="admin-actions">
              <button className="primary-button" disabled={isSaving} type="submit">포트폴리오 게시</button>
            </div>
          </form>
        </section>

        <section className="admin-panel" id="review-form">
          <div className="admin-panel__heading"><h2>후기 게시</h2></div>
          <form className="admin-form" onSubmit={submitReview}>
            <div className="admin-form__row">
              <label>작성자<input required value={reviewForm.author} onChange={(event) => setReviewForm({ ...reviewForm, author: event.target.value })} placeholder="예: 당근 고객" /></label>
              <label>평점<select value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: event.target.value })}><option value="5">5.0</option><option value="4.5">4.5</option><option value="4">4.0</option></select></label>
            </div>
            <label>출처<input value={reviewForm.source} onChange={(event) => setReviewForm({ ...reviewForm, source: event.target.value })} placeholder="예: 당근 후기, 관리자 직접 게시" /></label>
            <label>출처 링크<input value={reviewForm.sourceUrl} onChange={(event) => setReviewForm({ ...reviewForm, sourceUrl: event.target.value })} placeholder="선택 사항" /></label>
            <label>후기 내용<textarea required rows={5} value={reviewForm.content} onChange={(event) => setReviewForm({ ...reviewForm, content: event.target.value })} placeholder="후기를 입력해 주세요." /></label>
            <div className="admin-actions">
              <button className="primary-button" disabled={isSaving} type="submit">후기 게시</button>
            </div>
          </form>

        </section>
      </div>

      <section className="admin-panel admin-security" aria-labelledby="admin-security-title">
        <div className="admin-panel__heading">
          <KeyRound aria-hidden="true" />
          <div>
            <h2 id="admin-security-title">관리자 코드 변경</h2>
            <p>숫자 4~20자리로 설정할 수 있습니다.</p>
          </div>
        </div>
        <form className="admin-form admin-security__form" onSubmit={changeAdminPin}>
          <label>새 관리자 코드
            <input required minLength={4} maxLength={20} inputMode="numeric" pattern="[0-9]+" type="password" autoComplete="new-password" value={pinForm.newPin} onChange={(event) => setPinForm({ ...pinForm, newPin: event.target.value })} />
          </label>
          <label>새 관리자 코드 확인
            <input required minLength={4} maxLength={20} inputMode="numeric" pattern="[0-9]+" type="password" autoComplete="new-password" value={pinForm.confirmPin} onChange={(event) => setPinForm({ ...pinForm, confirmPin: event.target.value })} />
          </label>
          <button className="secondary-button" disabled={isSaving} type="submit">코드 변경</button>
        </form>
      </section>

      <AdminContentManager
        isSaving={isSaving}
        onMessage={setMessage}
        onRefresh={loadContent}
        pin={pin}
        portfolio={portfolio}
        reviewSettings={reviewSettings}
        reviews={reviews}
        setIsSaving={setIsSaving}
      />
    </main>
  );
}

function FileInput({ label, required, onChange }: { label: string; required: boolean; onChange: (file: File | null) => void }) {
  return <label>{label}<input required={required} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onChange(event.target.files?.[0] ?? null)} /></label>;
}

function useObjectUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}
