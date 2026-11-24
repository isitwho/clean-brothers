"use client";

import {
  AtSign,
  BookOpenText,
  Camera,
} from "lucide-react";
import { ContactLink } from "./ContactLink";

export function FooterLinks() {
  return (
    <div className="footer__link-group">
      <div className="footer__links" aria-label="외부 채널과 상담 연결">
        <a href="https://blog.naver.com/cleanbrothers2" target="_blank" rel="noreferrer">
          <BookOpenText aria-hidden="true" />
          <span>네이버 블로그</span>
        </a>
        <a href="https://www.instagram.com/cleanbrothers2/" target="_blank" rel="noreferrer">
          <Camera aria-hidden="true" />
          <span>인스타그램</span>
        </a>
        <a href="https://www.threads.net/@cleanbrothers2" target="_blank" rel="noreferrer">
          <AtSign aria-hidden="true" />
          <span>쓰레드</span>
        </a>
        <ContactLink label="문자" type="sms" showIcon />
        <ContactLink label="전화 상담" showIcon />
      </div>
    </div>
  );
}
