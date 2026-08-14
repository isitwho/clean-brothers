import { BeforeAfterSlider } from "../components/BeforeAfterSlider";
import { listPortfolioItems, listReviews } from "../lib/content";

const services = [
  ["입주·이사", "새 공간의 먼지와 공사 잔여물을 입주 전 정리합니다."],
  ["거주 공간", "생활 동선을 고려해 필요한 구역을 집중 관리합니다."],
  ["에어컨", "송풍구와 내부 오염을 분해 세척으로 정리합니다."],
  ["욕실", "물때, 유리 얼룩, 타일과 배수구를 단계별로 세척합니다."],
  ["주방·후드", "필터의 기름때부터 상판과 타일 오염까지 관리합니다."],
  ["곰팡이", "오염 범위와 표면 상태에 맞춰 제거 작업을 진행합니다."],
  ["사무실", "업무 흐름을 방해하지 않도록 공간별 순서를 설계합니다."],
  ["냉장고", "선반과 수납부를 분리해 내부 오염과 냄새를 정리합니다."],
];

const workingPrinciples = [
  ["상태 확인", "현장 오염도와 재질을 먼저 확인합니다."],
  ["맞춤 작업", "공간에 맞는 장비, 약품, 순서를 선택합니다."],
  ["세부 청소", "몰딩, 창틀, 배수구와 수납장 안쪽까지 살핍니다."],
  ["동행 검수", "고객과 결과를 함께 확인한 뒤 마무리합니다."],
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const [portfolio, reviews] = await Promise.all([
    listPortfolioItems(),
    listReviews(),
  ]);
  const heroItem = portfolio[0];

  return (
    <main className="site-shell">
      <header className="topbar" aria-label="주요 안내">
        <a className="brand-mark" href="#top" aria-label="클린브라더스 홈">
          <span>클린</span>브라더스
        </a>
        <nav className="nav-links" aria-label="사이트 메뉴">
          <a href="#portfolio">작업 결과</a>
          <a href="#services">서비스</a>
          <a href="#reviews">후기</a>
          <a href="/admin">관리</a>
        </nav>
        <a className="call-button" href="tel:050895959163">
          전화 상담
        </a>
      </header>

      <section id="top" className="hero">
        <div className="hero__copy">
          <h1>신뢰로 만드는 깨끗함.</h1>
          <p className="hero__lead">
            전문청소지도사 1급 보유자가 공간을 확인하고, 작업 후 고객과
            함께 검수합니다.
          </p>
          <div className="hero__actions">
            <a className="primary-button" href="#portfolio">
              작업 결과 보기
            </a>
            <a className="secondary-button" href="tel:050895959163">
              0508-9595-9163
            </a>
          </div>
        </div>

        <div className="hero__visual" aria-label="대표 전후 포트폴리오">
          <BeforeAfterSlider
            title={heroItem.title}
            beforeSrc={heroItem.beforeSrc}
            afterSrc={heroItem.afterSrc}
            splitSrc={heroItem.splitSrc}
          />
          <div className="hero__caption">
            <span>{heroItem.category}</span>
            <strong>{heroItem.title}</strong>
          </div>
        </div>
      </section>

      <section className="proof-band" aria-label="클린브라더스 주요 정보">
        <dl>
          <div><dt>평점</dt><dd>4.9</dd></div>
          <div><dt>후기</dt><dd>17</dd></div>
          <div><dt>단골</dt><dd>88</dd></div>
          <div><dt>상담</dt><dd>24시간</dd></div>
        </dl>
        <p>서울 강동구 천호동을 중심으로 방문합니다.</p>
      </section>

      <section className="manifesto section-shell">
        <h2>보이는 곳만 닦지 않습니다.</h2>
        <p>
          몰딩, 창틀, 배수구, 수납장 안쪽까지 확인하는 디테일 청소를
          지향합니다. 빠른 마무리보다 정확한 결과를 우선합니다.
        </p>
      </section>

      <section id="portfolio" className="portfolio section-shell">
        <div className="section-heading">
          <h2>직접 움직여 확인하는 작업 결과</h2>
          <p>슬라이더를 좌우로 움직이면 작업 후와 작업 전을 비교할 수 있습니다.</p>
        </div>
        <div className="portfolio-grid">
          {portfolio.map((item, index) => (
            <article className={`portfolio-card portfolio-card--${index + 1}`} key={item.id}>
              <BeforeAfterSlider
                title={item.title}
                beforeSrc={item.beforeSrc}
                afterSrc={item.afterSrc}
                splitSrc={item.splitSrc}
              />
              <div className="portfolio-card__body">
                <div>
                  <span>{item.category}</span>
                  <span>{item.location}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="services section-shell">
        <div className="section-heading">
          <h2>공간에 맞춰 범위를 정합니다.</h2>
          <p>필요한 곳은 더 깊게, 불필요한 작업은 줄여 합리적으로 구성합니다.</p>
        </div>
        <div className="service-list">
          {services.map(([name, description]) => (
            <article key={name}>
              <h3>{name}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="process section-shell" aria-labelledby="process-title">
        <h2 id="process-title">처음부터 검수까지 한 흐름으로</h2>
        <ol>
          {workingPrinciples.map(([title, description]) => (
            <li key={title}>
              <strong>{title}</strong>
              <span>{description}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="reviews" className="reviews section-shell">
        <div className="section-heading">
          <h2>작업을 경험한 고객의 말</h2>
        </div>
        <div className="review-grid">
          {reviews.map((review) => (
            <figure className="review-card" key={review.id}>
              <blockquote>“{review.content}”</blockquote>
              <figcaption>
                <strong>{review.author}</strong>
                <span>평점 {review.rating.toFixed(1)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="contact section-shell">
        <div>
          <h2>청소가 필요한 공간을 알려주세요.</h2>
          <p>현장 상태와 필요한 범위를 확인한 뒤 견적을 안내합니다.</p>
        </div>
        <a className="primary-button" href="tel:050895959163">
          전화 상담
        </a>
      </section>

      <footer className="footer section-shell">
        <div>
          <strong>클린브라더스</strong>
          <p>서울특별시 강동구 구천면로64길 9-9</p>
          <p>입주청소 / 이사청소</p>
        </div>
        <div className="footer__links">
          <a href="https://blog.naver.com/cleanbrothers2">네이버 블로그</a>
          <a href="tel:050895959163">0508-9595-9163</a>
        </div>
      </footer>
    </main>
  );
}
