---
name: Clean Brothers Surface Record
description: 실제 작업 결과를 중심으로 신뢰를 만드는 전문 청소 기록 시스템
colors:
  cobalt-action: "#1f5cff"
  cobalt-deep: "#1747c9"
  cobalt-wash: "#dfe8ff"
  mineral-ground: "#eef1f4"
  paper-surface: "#f8fafb"
  ink-navy: "#111a2c"
  record-gray: "#596477"
  rule-gray: "#cbd2dc"
typography:
  display:
    fontFamily: "Gothic A1, Noto Sans KR, sans-serif"
    fontSize: "clamp(3.625rem, 6.5vw, 5.875rem)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Gothic A1, Noto Sans KR, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.68
rounded:
  control: "12px"
  media: "16px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "24px"
  lg: "48px"
  section: "120px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt-action}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "48px"
---

# Design System: Clean Brothers Surface Record

## Overview

**Creative North Star: "The Surface Record"**

이 시스템은 청소를 장식적인 라이프스타일 서비스가 아니라 표면을 진단하고 복원하는 전문 작업으로 보여 준다. 실제 Before/After 사진이 가장 큰 시각 자산이며, 넓은 여백과 촘촘한 기록형 정보가 사진의 증거성을 강화한다.

밝은 미네랄 바탕과 잉크 네이비가 신뢰를 만들고 코발트는 행동과 작업 후 상태에만 사용한다. 카드보다 선, 밴드, 간격으로 정보를 묶는다.

**Key Characteristics:**

- 결과 사진이 항상 주장보다 먼저 온다.
- 코발트는 행동과 After 상태에만 집중한다.
- 섹션은 같은 카드 모양을 반복하지 않는다.
- 큰 제목과 작은 기록 정보가 선명하게 대비된다.

## Colors

차갑고 깨끗한 무채색 위에 코발트 하나만 사용하는 정밀한 팔레트다.

### Primary

- **Cobalt Action**: 상담 행동, 포커스, After 라벨에만 사용한다.

### Neutral

- **Mineral Ground**: 페이지 전체의 밝은 작업장 바탕이다.
- **Paper Surface**: 내비게이션과 필요한 보조 표면에 사용한다.
- **Ink Navy**: 제목과 핵심 정보의 기본 잉크다.
- **Record Gray**: 설명과 부가 정보에 사용한다.
- **Rule Gray**: 기록을 구분하는 얇은 선에 사용한다.

**The One Cobalt Rule.** 새로운 강조색을 추가하지 않는다. 상태 구분은 명도, 굵기, 간격으로 해결한다.

## Typography

**Display Font:** Gothic A1 (with Noto Sans KR fallback)
**Body Font:** Gothic A1 (with Noto Sans KR fallback)
**Label/Mono Font:** Geist Mono, only for technical values when needed

**Character:** 한국어 획의 구조가 분명한 고딕체를 높은 굵기로 사용한다. 제목은 조밀하고 단호하며 본문은 긴 호흡으로 읽힌다.

### Hierarchy

- **Display** (900, fluid 58-94px, 0.98): 첫 화면의 단일 약속에만 사용한다.
- **Headline** (800, fluid 38-72px, 1.04): 섹션의 핵심 메시지를 짧게 전달한다.
- **Title** (700-800, 18-30px, 1.2): 사례명과 서비스명에 사용한다.
- **Body** (500-600, 16-20px, 1.6-1.78): 65ch 이하로 유지한다.
- **Label** (700-800, 12-14px): 카테고리, 위치, 수치 이름에 사용하며 강제 대문자는 쓰지 않는다.

**The Short Heading Rule.** 제목은 설명을 대신하지 않는다. 한 문장보다 길어지면 본문으로 내린다.

## Layout

최대 1240px 컨테이너를 사용한다. 첫 화면은 텍스트 38%, 비교 사진 62%의 비대칭 구성이며, 작업 사례는 큰 세로 사례와 작은 가로 사례가 이어지는 편집형 그리드다. 서비스와 과정은 카드 대신 수평 기록 밴드로 구분한다. 960px 아래에서는 한 열로, 680px 아래에서는 좌우 여백 14px의 단일 흐름으로 전환한다.

## Elevation & Depth

기본 표면은 평평하다. 큰 비교 사진에만 넓고 낮은 주변 그림자를 사용해 실제 결과물을 전면으로 들어 올린다. 나머지 정보는 배경 명도와 한 줄 구분선으로 깊이를 만든다.

### Shadow Vocabulary

- **Portfolio Lift** (`0 28px 70px rgba(35, 48, 73, 0.16)`): 첫 화면 대표 비교 사진에만 사용한다.

**The Evidence Lift Rule.** 그림자는 증거 사진을 강조할 때만 허용한다.

## Shapes

미디어와 주요 행동은 12-16px의 부드러운 모서리를 사용한다. 정보 행과 기록 밴드는 모서리 컨테이너 없이 선과 간격으로 구분한다. 원형은 비교 슬라이더 손잡이에만 사용한다.

## Components

### Buttons

- **Shape:** 단단한 12px 모서리, 높이 48px.
- **Primary:** 코발트 바탕과 고대비 글자, 좌우 22px 패딩.
- **Hover / Focus:** 더 짙은 코발트와 3px 포커스 링.
- **Secondary:** 밝은 표면과 회색 외곽선, 잉크 네이비 글자.

### Cards / Containers

- **Corner Style:** 미디어만 16px. 일반 정보는 카드로 감싸지 않는다.
- **Background:** 페이지 바탕 또는 종이 표면을 사용한다.
- **Shadow Strategy:** 대표 비교 사진 외에는 기본적으로 사용하지 않는다.
- **Border:** 정보 그룹 사이에 한 줄만 사용한다.

### Inputs / Fields

- **Style:** 종이 표면, 12px 모서리, Rule Gray 외곽선.
- **Focus:** 코발트 외곽선과 투명 포커스 링.

### Navigation

72px 이하의 한 줄 내비게이션이다. 브랜드는 왼쪽, 링크는 중앙, 전화 상담은 오른쪽에 둔다. 모바일에서는 후기 링크와 상단 전화 버튼을 숨기고 본문의 상담 행동을 유지한다.

### Before/After Compare

Before는 왼쪽, After는 오른쪽이다. 중립색 Before 라벨과 코발트 After 라벨을 사용한다. 두 이미지는 같은 고정 크기로 겹치고 클리핑 경계만 움직여 줌이나 비율 변화가 생기지 않는다. 투명 범위 입력이 전체 이미지를 덮고, 키보드 포커스 시 프레임 안쪽에 코발트 링이 나타난다.

## Do's and Don'ts

### Do:

- **Do** 실제 작업 사진을 가장 큰 시각 요소로 사용한다.
- **Do** 한 섹션에 하나의 분명한 메시지만 둔다.
- **Do** 줄, 간격, 명도 차이로 기록을 구조화한다.

### Don't:

- **Don't** 민트색, 금색, 따뜻한 베이지를 보조 강조색으로 추가하지 않는다.
- **Don't** 같은 크기의 둥근 카드 행으로 페이지를 구성하지 않는다.
- **Don't** 확인되지 않은 가격, 수상, 성과 수치를 시각적 장식으로 만들지 않는다.
