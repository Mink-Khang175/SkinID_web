# SkinID Homepage Style System

> Nguồn chuẩn duy nhất: homepage hiện tại của SkinID. Tài liệu này là hợp đồng thị giác cho các màn hình mới; không lấy `profile` hoặc `skin-analysis` làm tham chiếu.

## 1. Tinh thần thiết kế

SkinID là một không gian chăm sóc da sáng, mềm và có nhịp thở:

- editorial, nhiều khoảng trắng và hierarchy rõ;
- **borderless & floating**: ưu tiên nền, gradient, shadow và khoảng cách thay cho viền;
- dược mỹ phẩm đáng tin nhưng không lạnh như dashboard y tế;
- hồng là điểm nhấn, không phủ toàn bộ giao diện;
- hình ảnh sản phẩm là nhân vật chính, có vùng thở và cảm giác lơ lửng;
- nhịp nội dung: kicker → heading → mô tả → CTA → hình ảnh/chi tiết.

## 2. Nguồn tham chiếu trong code

Chỉ tham chiếu homepage từ:

- `src/styles/soft-storefront.css` — token thương hiệu, header, catalog và storefront primitives;
- `src/styles/home-refresh.css` — hero, section, floating surface và animation;
- `src/pages/HomePage.jsx` và `src/components/home/`.

Không copy style từ:

- `src/styles/profile.css`;
- `src/styles/scan-refresh.css`;
- component riêng của profile, lịch sử soi da hoặc báo cáo soi da.

Nếu một màn hình cũ chưa giống homepage, refactor về hệ thống này thay vì tạo thêm một biến thể style riêng.

## 3. Design tokens

```css
:root {
  --skinid-primary: #E06D81;
  --skinid-accent: #FF6B8B;
  --skinid-blush: #FFF2F4;
  --skinid-petal: #FFD6DE;
  --skinid-soft-bg: #FFFAFB;
  --skinid-dark: #282326;
  --skinid-light: #FFF8F9;
  --skinid-muted: #6F686B;
  --skinid-border: #F0ECEE;
  --skinid-rose-dark: #BD3F5B;
  --skinid-cta-start: #FF7893;
  --skinid-cta-mid: #F25576;
  --skinid-cta-end: #DC3E63;
  --skinid-cta-shadow: rgba(224, 62, 98, .30);
}
```

Usage:

- `primary`: active state, links, label và CTA chính;
- `blush` / `soft-bg`: nền section, badge, empty state;
- `dark`: heading và navigation;
- `muted`: mô tả, metadata, helper text;
- `petal`: divider/outline rất nhẹ khi thật sự cần.

Không dùng đen tuyệt đối cho typography hoặc nhiều accent cạnh tranh trong cùng section.

## 4. Typography

```css
body {
  color: var(--skinid-dark);
  font-family: "Be Vietnam Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

| Vai trò | Kích thước | Đặc tính |
| --- | ---: | --- |
| Hero heading | `clamp(2.8rem, 6vw, 6.5rem)` | weight 800, line-height `.98–1.04`, tracking âm |
| Section heading | `clamp(2rem, 4vw, 4rem)` | weight 800, tối đa 2 dòng |
| Card heading | `1rem–1.35rem` | weight 700–800 |
| Body | `.9rem–1rem` | line-height `1.65–1.8`, muted |
| Kicker | `.62rem–.75rem` | uppercase, letter-spacing `.12–.16em` |

## 5. Layout và floating surface

```css
.skinid-container {
  width: min(calc(100% - 48px), 1240px);
  margin-inline: auto;
}

.skinid-surface {
  border: 0;
  border-radius: 30px;
  background: rgba(255, 255, 255, .88);
  box-shadow: 0 20px 48px rgba(52, 35, 41, .07);
}

.skinid-surface--soft {
  background:
    radial-gradient(circle at 90% 8%, rgba(219, 241, 255, .82), transparent 32%),
    linear-gradient(135deg, #FFF0F4, #FFF 64%);
}
```

Quy tắc:

- desktop content width `1180–1240px`;
- section có thể full-bleed, nội dung bên trong vẫn theo container;
- grid editorial thường dùng `1.1fr/.9fr` hoặc `1.2fr/.8fr`;
- radius chính `24–34px`, pill `999px`;
- shadow mềm và rộng, không dùng shadow đen sắc;
- hover chỉ nâng nhẹ `translateY(-3px)`;
- không biến mọi nội dung thành card.

## 6. Button và control

```css
.skinid-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  padding: .75rem 1.35rem;
  border: 0;
  border-radius: 999px;
  font-size: .78rem;
  font-weight: 800;
  transition: transform .3s cubic-bezier(.16, 1, .3, 1),
    box-shadow .3s ease, background .25s ease;
}

.skinid-button--primary {
  color: #fff;
  background: linear-gradient(135deg, var(--skinid-cta-start), var(--skinid-cta-end));
  box-shadow: 0 13px 28px var(--skinid-cta-shadow);
}

.skinid-button--primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 17px 34px rgba(224, 62, 98, .38);
}
```

Không dùng nút vuông góc nhỏ kiểu admin/dashboard cho hành động chính.

## 7. Background và decorative language

```css
.skinid-page {
  background:
    radial-gradient(circle at 5% 8%, rgba(255, 220, 229, .65), transparent 24%),
    radial-gradient(circle at 94% 42%, rgba(218, 241, 255, .68), transparent 25%),
    linear-gradient(180deg, #FFFAFB 0%, #FFF 46%, #FFF9F6 100%);
}

.skinid-orbit {
  border: 1px solid rgba(233, 102, 130, .10);
  border-radius: 50%;
  box-shadow: 0 0 0 32px rgba(255, 255, 255, .22);
  pointer-events: none;
}
```

Orbit, glow và gradient chỉ làm nền; không đặt chúng lên chữ hoặc làm giảm contrast.

## 8. Animation

```css
@keyframes skinid-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.skinid-enter { animation: skinid-rise .72s cubic-bezier(.16, 1, .3, 1) both; }

@keyframes skinid-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.skinid-float { animation: skinid-float 4s ease-in-out infinite; }
```

- entrance theo thứ tự kicker → heading → body → CTA → image;
- stagger `60–120ms`, tối đa 5–6 phần tử;
- floating chỉ dùng cho product art, biên độ `3–5px`, chu kỳ `3–4s`;
- dùng ease-out/cubic-bezier, không dùng `linear` cho chuyển động giao diện;
- hover nhẹ, không phóng đại quá mức.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 9. Responsive contract

- `≥ 1100px`: editorial grid, hero image lớn, card grid 3–4 cột;
- `761–1099px`: giảm gap, card grid 2 cột;
- `≤ 760px`: một cột, CTA có thể full-width, tabs chuyển grid 2 cột;
- không ẩn nội dung quan trọng ở breakpoint;
- mobile giữ radius lớn nhưng giảm về `24–28px`.

## 10. Accessibility và content tone

- giữ contrast tốt giữa body text và nền;
- icon-only button phải có `aria-label`;
- không bỏ `:focus-visible`;
- animation không được là điều kiện để đọc nội dung;
- câu chữ thân thiện, hướng dẫn và có tính tham khảo;
- tránh “chắc chắn”, “điều trị”, “bắt buộc”, “hiệu quả tối ưu” nếu không có căn cứ;
- sản phẩm chăm sóc da không được trình bày như chẩn đoán y khoa.

## 11. Checklist trước khi merge

- [ ] Dùng token `--skinid-*`, không tạo palette riêng.
- [ ] Surface chính borderless, radius và shadow cùng nhịp homepage.
- [ ] CTA là pill, hover nâng nhẹ.
- [ ] Có responsive desktop/tablet/mobile.
- [ ] Có entrance animation và reduced-motion fallback.
- [ ] Không copy style từ `profile.css` hoặc `scan-refresh.css`.
- [ ] Kiểm tra trực tiếp ở 1440px và 390px.

