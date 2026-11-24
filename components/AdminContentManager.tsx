"use client";

import { ArrowDown, ArrowUp, Check, Pencil, Star, Trash2, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { RatingStars } from "./RatingStars";

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

export type ReviewSettings = {
  featuredReviewId: string;
  randomReview: boolean;
};

type AdminContentManagerProps = {
  isSaving: boolean;
  onMessage: (message: string) => void;
  onRefresh: () => Promise<void>;
  pin: string;
  portfolio: PortfolioItem[];
  reviewSettings: ReviewSettings;
  reviews: ReviewItem[];
  setIsSaving: (saving: boolean) => void;
};

export function AdminContentManager({
  isSaving,
  onMessage,
  onRefresh,
  pin,
  portfolio,
  reviewSettings,
  reviews,
  setIsSaving,
}: AdminContentManagerProps) {
  const [editingPortfolioId, setEditingPortfolioId] = useState("");
  const [editingReviewId, setEditingReviewId] = useState("");

  async function moveItem(kind: "portfolio" | "review", index: number, offset: -1 | 1) {
    const current = kind === "portfolio" ? portfolio : reviews;
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= current.length) return;

    const reordered = [...current];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setIsSaving(true);
    onMessage("콘텐츠 순서를 저장하는 중입니다.");
    const response = await fetch("/api/admin/order", {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ kind, ids: reordered.map((item) => item.id) }),
    });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);
    onMessage(response.ok ? "콘텐츠 순서가 저장되었습니다." : (data.error ?? "콘텐츠 순서 변경에 실패했습니다."));
    await onRefresh();
  }

  async function deleteItem(kind: "portfolio" | "review", id: string) {
    if (!window.confirm("이 콘텐츠를 제거할까요? 제거 후에는 되돌릴 수 없습니다.")) return;
    setIsSaving(true);
    const response = await fetch(kind === "portfolio" ? "/api/portfolio" : "/api/reviews", {
      method: "DELETE",
      headers: { "content-type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ id }),
    });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);
    if (!response.ok) {
      onMessage(data.error ?? "콘텐츠 제거에 실패했습니다.");
      return;
    }
    if (kind === "portfolio") setEditingPortfolioId("");
    else setEditingReviewId("");
    onMessage("콘텐츠가 제거되었습니다.");
    await onRefresh();
  }

  async function savePortfolio(body: FormData) {
    setIsSaving(true);
    onMessage("포트폴리오 수정을 저장하는 중입니다.");
    const response = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "x-admin-pin": pin },
      body,
    });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);
    if (!response.ok) {
      onMessage(data.error ?? "포트폴리오 수정에 실패했습니다.");
      return false;
    }
    setEditingPortfolioId("");
    onMessage("포트폴리오가 수정되었습니다.");
    await onRefresh();
    return true;
  }

  async function saveReview(payload: Record<string, unknown>) {
    setIsSaving(true);
    onMessage("후기 수정을 저장하는 중입니다.");
    const response = await fetch("/api/reviews", {
      method: "PUT",
      headers: { "content-type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);
    if (!response.ok) {
      onMessage(data.error ?? "후기 수정에 실패했습니다.");
      return false;
    }
    setEditingReviewId("");
    onMessage("후기가 수정되었습니다.");
    await onRefresh();
    return true;
  }

  async function featureReview(id: string) {
    setIsSaving(true);
    onMessage("메인 후기를 변경하는 중입니다.");
    const response = await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ featuredReviewId: id, randomReview: false }),
    });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);
    onMessage(response.ok ? "메인 후기가 변경되었습니다." : (data.error ?? "메인 후기 변경에 실패했습니다."));
    await onRefresh();
  }

  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__heading">
        <h2>게시된 콘텐츠</h2>
        <p>순서를 바꾸거나, 각 항목 안에서 바로 수정할 수 있습니다.</p>
      </div>

      <h3 className="admin-list-title">포트폴리오</h3>
      <div className="admin-list admin-list--portfolio">
        {portfolio.length ? portfolio.map((item, index) => (
          <article key={item.id} className={editingPortfolioId === item.id ? "admin-item admin-item--editing" : "admin-item"}>
            <PortfolioPreview item={item} />
            <div className="admin-item__content">
              <strong>{item.title}</strong>
              <span>{item.category}</span>
              <p>{item.summary}</p>
            </div>
            <ItemActions
              disabled={isSaving}
              index={index}
              isEditing={editingPortfolioId === item.id}
              length={portfolio.length}
              name={item.title}
              onCancel={() => setEditingPortfolioId("")}
              onDelete={() => void deleteItem("portfolio", item.id)}
              onEdit={() => { setEditingReviewId(""); setEditingPortfolioId(item.id); }}
              onMove={(offset) => void moveItem("portfolio", index, offset)}
            />
            {editingPortfolioId === item.id ? (
              <PortfolioInlineEditor
                disabled={isSaving}
                item={item}
                onCancel={() => setEditingPortfolioId("")}
                onSave={savePortfolio}
              />
            ) : null}
          </article>
        )) : <p className="admin-empty">게시된 포트폴리오가 없습니다. 위 양식에서 첫 작업 사례를 추가해 주세요.</p>}
      </div>

      <h3 className="admin-list-title">후기</h3>
      <div className="admin-list admin-list--reviews">
        {reviews.length ? reviews.map((review, index) => {
          const isFeatured = !reviewSettings.randomReview && reviewSettings.featuredReviewId === review.id;
          return (
            <article key={review.id} className={editingReviewId === review.id ? "admin-item admin-item--editing" : "admin-item"}>
              <div className="admin-item__content">
                <div className="admin-item__title-row">
                  <strong>{review.author}</strong>
                  {isFeatured ? <span className="featured-badge"><Check aria-hidden="true" />메인 후기</span> : null}
                </div>
                <RatingStars rating={review.rating} />
                <span>{review.source}</span>
                <p>{review.content}</p>
              </div>
              <div className="admin-item-actions">
                <div className="admin-order-actions" aria-label={`${review.author} 후기 순서 변경`}>
                  <button disabled={isSaving || index === 0} type="button" onClick={() => void moveItem("review", index, -1)}><ArrowUp aria-hidden="true" />위로</button>
                  <button disabled={isSaving || index === reviews.length - 1} type="button" onClick={() => void moveItem("review", index, 1)}><ArrowDown aria-hidden="true" />아래로</button>
                </div>
                <div className="admin-edit-actions">
                  {!isFeatured ? <button disabled={isSaving} type="button" onClick={() => void featureReview(review.id)}><Star aria-hidden="true" />메인 후기로 선택</button> : null}
                  {editingReviewId === review.id ? (
                    <button type="button" onClick={() => setEditingReviewId("")}><X aria-hidden="true" />닫기</button>
                  ) : (
                    <button type="button" onClick={() => { setEditingPortfolioId(""); setEditingReviewId(review.id); }}><Pencil aria-hidden="true" />수정</button>
                  )}
                  <button className="danger-button" type="button" onClick={() => void deleteItem("review", review.id)}><Trash2 aria-hidden="true" />제거</button>
                </div>
              </div>
              {editingReviewId === review.id ? (
                <ReviewInlineEditor disabled={isSaving} onCancel={() => setEditingReviewId("")} onSave={saveReview} review={review} />
              ) : null}
            </article>
          );
        }) : <p className="admin-empty">게시된 후기가 없습니다. 위 양식에서 첫 후기를 추가해 주세요.</p>}
      </div>
    </section>
  );
}

function ItemActions({
  disabled,
  index,
  isEditing,
  length,
  name,
  onCancel,
  onDelete,
  onEdit,
  onMove,
}: {
  disabled: boolean;
  index: number;
  isEditing: boolean;
  length: number;
  name: string;
  onCancel: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onMove: (offset: -1 | 1) => void;
}) {
  return (
    <div className="admin-item-actions">
      <div className="admin-order-actions" aria-label={`${name} 순서 변경`}>
        <button disabled={disabled || index === 0} type="button" onClick={() => onMove(-1)}><ArrowUp aria-hidden="true" />위로</button>
        <button disabled={disabled || index === length - 1} type="button" onClick={() => onMove(1)}><ArrowDown aria-hidden="true" />아래로</button>
      </div>
      <div className="admin-edit-actions">
        {isEditing ? <button type="button" onClick={onCancel}><X aria-hidden="true" />닫기</button> : <button type="button" onClick={onEdit}><Pencil aria-hidden="true" />수정</button>}
        <button className="danger-button" type="button" onClick={onDelete}><Trash2 aria-hidden="true" />제거</button>
      </div>
    </div>
  );
}

function PortfolioInlineEditor({ disabled, item, onCancel, onSave }: {
  disabled: boolean;
  item: PortfolioItem;
  onCancel: () => void;
  onSave: (body: FormData) => Promise<boolean>;
}) {
  const [form, setForm] = useState({
    title: item.title,
    category: item.category,
    location: item.location,
    completedAt: normalizeDate(item.completedAt),
    summary: item.summary,
  });
  const [before, setBefore] = useState<File | null>(null);
  const [after, setAfter] = useState<File | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = new FormData();
    body.set("id", item.id);
    Object.entries(form).forEach(([key, value]) => body.set(key, value));
    if (before) body.set("before", before);
    if (after) body.set("after", after);
    await onSave(body);
  }

  return (
    <form className="admin-inline-form" onSubmit={submit}>
      <label>제목<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label>카테고리<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
      <label>지역<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
      <label>작업일<input type="date" value={form.completedAt} onChange={(event) => setForm({ ...form, completedAt: event.target.value })} /></label>
      <label className="admin-inline-form__wide">설명<textarea required rows={3} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} /></label>
      <label>작업 전 사진 교체<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setBefore(event.target.files?.[0] ?? null)} /></label>
      <label>작업 후 사진 교체<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setAfter(event.target.files?.[0] ?? null)} /></label>
      <div className="admin-actions admin-inline-form__wide">
        <button className="primary-button" disabled={disabled} type="submit">수정 저장</button>
        <button className="text-button" type="button" onClick={onCancel}>취소</button>
      </div>
    </form>
  );
}

function ReviewInlineEditor({ disabled, onCancel, onSave, review }: {
  disabled: boolean;
  onCancel: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<boolean>;
  review: ReviewItem;
}) {
  const [form, setForm] = useState({
    author: review.author,
    rating: String(review.rating),
    source: review.source,
    sourceUrl: review.sourceUrl ?? "",
    content: review.content,
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave({
      ...form,
      id: review.id,
      rating: Number(form.rating),
      sourceType: form.source.includes("당근") ? "daangn" : "manual",
    });
  }

  return (
    <form className="admin-inline-form" onSubmit={submit}>
      <label>작성자<input required value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} /></label>
      <label>평점<select value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })}>{[5, 4.9, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((rating) => <option key={rating} value={rating}>{rating.toFixed(1)}</option>)}</select></label>
      <label>출처<input value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} /></label>
      <label>출처 링크<input value={form.sourceUrl} onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })} /></label>
      <label className="admin-inline-form__wide">후기 내용<textarea required rows={4} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label>
      <div className="admin-actions admin-inline-form__wide">
        <button className="primary-button" disabled={disabled} type="submit">수정 저장</button>
        <button className="text-button" type="button" onClick={onCancel}>취소</button>
      </div>
    </form>
  );
}

function PortfolioPreview({ item }: { item: PortfolioItem }) {
  if (item.splitSrc) return <img className="admin-item__preview" src={item.splitSrc} alt={`${item.title} 작업 전후 미리보기`} />;
  return (
    <div className="admin-item__preview admin-item__preview--pair">
      {item.beforeSrc ? <img src={item.beforeSrc} alt={`${item.title} 작업 전`} /> : null}
      {item.afterSrc ? <img src={item.afterSrc} alt={`${item.title} 작업 후`} /> : null}
    </div>
  );
}

function normalizeDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";
}
