"use client";

import { useId, useState } from "react";

type BeforeAfterSliderProps = {
  title: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeSrc?: string;
  afterSrc?: string;
  splitSrc?: string;
  className?: string;
};

export function BeforeAfterSlider({
  title,
  beforeLabel = "작업 전",
  afterLabel = "작업 후",
  beforeSrc,
  afterSrc,
  splitSrc,
  className = "",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const id = useId();
  const hasSplit = Boolean(splitSrc);

  const beforeImage = splitSrc ?? beforeSrc;
  const afterImage = splitSrc ?? afterSrc ?? beforeSrc;

  return (
    <div className={`compare ${className}`}>
      <div className="compare__frame">
        {afterImage ? (
          <img
            src={afterImage}
            alt={`${title} ${afterLabel}`}
            className={hasSplit ? "compare__image compare__image--right" : "compare__image"}
          />
        ) : null}
        {beforeImage ? (
          <div
            className="compare__before"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <img
              src={beforeImage}
              alt={`${title} ${beforeLabel}`}
              className={
                hasSplit
                  ? "compare__image compare__image--left"
                  : "compare__image"
              }
            />
          </div>
        ) : null}
        <div className="compare__shade compare__shade--before">{beforeLabel}</div>
        <div className="compare__shade compare__shade--after">{afterLabel}</div>
        <div className="compare__handle" style={{ left: `${position}%` }} />
        <input
          id={id}
          aria-label={`${title} 전후 비교`}
          className="compare__range"
          type="range"
          min="0"
          max="100"
          value={position}
          aria-valuetext={`왼쪽 ${beforeLabel} ${position}%, 오른쪽 ${afterLabel} ${100 - position}%`}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </div>
    </div>
  );
}
