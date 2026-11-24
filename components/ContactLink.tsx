"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const phoneNumber = "050895959163";
const phoneDisplay = "0508-9595-9163";

type ContactLinkProps = {
  className?: string;
  label: string;
  type?: "tel" | "sms";
  showIcon?: boolean;
};

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024);
}

async function copyPhoneNumber() {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(phoneDisplay);
    return;
  }

  const input = document.createElement("textarea");
  input.value = phoneDisplay;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

export function ContactLink({
  className = "",
  label,
  type = "tel",
  showIcon = false,
}: ContactLinkProps) {
  const [feedback, setFeedback] = useState("");
  const timerRef = useRef<number | null>(null);
  const Icon = type === "sms" ? MessageCircle : Phone;

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  async function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (isMobileDevice()) return;

    event.preventDefault();
    try {
      await copyPhoneNumber();
      setFeedback("번호 복사됨");
    } catch {
      setFeedback(phoneDisplay);
    }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setFeedback(""), 2400);
  }

  return (
    <a
      className={className}
      href={`${type}:${phoneNumber}`}
      onClick={(event) => void handleClick(event)}
      title="PC에서는 전화번호를 복사하고, 모바일에서는 연결 앱을 엽니다."
    >
      {showIcon ? <Icon aria-hidden="true" /> : null}
      <span>{feedback || label}</span>
    </a>
  );
}
