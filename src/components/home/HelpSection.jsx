import { assetUrl } from '../../assets/index.js';

export default function HelpSection() {
  return (
    <>
<section id="skin-advisor" className="section help-shop" aria-labelledby="skin-advisor-title">
  <div className="help-shop__glow help-shop__glow--one" aria-hidden="true"></div>
  <div className="help-shop__glow help-shop__glow--two" aria-hidden="true"></div>
  <div className="container help-grid">
    <div className="help-copy">
      <span className="help-tech-badge"><i data-feather="cpu"></i> AI SKINTECH 4.0</span>
      <h2 id="skin-advisor-title">Biến lựa chọn skincare thành một trải nghiệm cá nhân</h2>
      <p>Soi da bằng AI trong vài bước để nhận gợi ý chăm sóc cá nhân hóa và tìm nhanh nhóm sản phẩm phù hợp hơn.</p>
      <div className="help-actions">
        <a className="btn help-btn--primary" href="/skin-analysis"><i data-feather="camera"></i> Bắt đầu soi da AI</a>
        <button className="btn help-btn--glass" type="button" onClick={() => window?.openConsultation?.()}><i data-feather="message-circle"></i> Tư vấn nhanh</button>
      </div>
      <small className="help-privacy"><i data-feather="lock"></i> Hình ảnh phân tích được xử lý riêng tư và không lưu trữ.</small>
    </div>
    <div className="help-visual" aria-hidden="true">
      <div className="help-visual__halo"></div>
      <img src={assetUrl('/images/banners/ai-skin-model-v1.png')} alt="" loading="lazy" />
      <svg className="help-face-mesh" viewBox="0 0 240 320" fill="none">
        <ellipse cx="120" cy="151" rx="76" ry="112" />
        <path d="M55 101 Q120 132 185 101 M47 145 Q120 174 193 145 M52 194 Q120 220 188 194 M77 61 Q120 88 163 61 M120 39 V263 M73 73 Q95 151 77 238 M167 73 Q145 151 163 238" />
        <circle cx="73" cy="73" r="3" /><circle cx="167" cy="73" r="3" />
        <circle cx="55" cy="101" r="3" /><circle cx="185" cy="101" r="3" />
        <circle cx="47" cy="145" r="3" /><circle cx="193" cy="145" r="3" />
        <circle cx="52" cy="194" r="3" /><circle cx="188" cy="194" r="3" />
        <circle cx="77" cy="238" r="3" /><circle cx="163" cy="238" r="3" />
        <circle cx="120" cy="39" r="3" /><circle cx="120" cy="263" r="3" />
      </svg>
      <div className="help-scan-line"></div>
      <span className="help-visual__status"><i></i> AI đang nhận diện 12 vùng da</span>
    </div>
    <div className="help-options" aria-label="Chọn nhanh nhu cầu làn da">
      <button className="concern-card" type="button" data-benefit="tri-mun-kiem-dau" data-step="all"><i data-feather="circle"></i><span><b>Da dầu & mụn</b><small>Làm sạch & kiềm dầu</small></span><i data-feather="arrow-up-right"></i></button>
      <button className="concern-card" type="button" data-benefit="cap-am-chuyen-sau" data-step="all"><i data-feather="droplet"></i><span><b>Da khô, thiếu ẩm</b><small>Cấp ẩm chuyên sâu</small></span><i data-feather="arrow-up-right"></i></button>
      <button className="concern-card" type="button" data-benefit="phuc-hoi-diu-da" data-step="all"><i data-feather="feather"></i><span><b>Da nhạy cảm</b><small>Phục hồi & làm dịu</small></span><i data-feather="arrow-up-right"></i></button>
      <button className="concern-card" type="button" data-benefit="sang-da-mo-tham" data-step="all"><i data-feather="sun"></i><span><b>Thâm nám & sắc tố</b><small>Sáng da & mờ thâm</small></span><i data-feather="arrow-up-right"></i></button>
    </div>
  </div>
</section>
    </>
  );
}
