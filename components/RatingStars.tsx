type RatingStarsProps = {
  className?: string;
  rating: number;
};

export function RatingStars({ className = "", rating }: RatingStarsProps) {
  const count = Math.max(1, Math.min(5, Math.round(rating)));
  return (
    <span className={`rating-stars ${className}`} role="img" aria-label={`평점 ${rating.toFixed(1)}점`}>
      <span aria-hidden="true">{"⭐".repeat(count)}</span>
    </span>
  );
}
