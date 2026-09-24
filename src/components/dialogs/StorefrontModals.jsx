export default function StorefrontModals() {
  return (
    <>
<div className="storefront-modals-root">
  <div id="consultation-modal" className="modal" role="dialog" aria-modal="true" aria-labelledby="consult-title">
    <div className="modal-panel">
      <button className="modal-close" type="button" onClick={(event) => window?.closeConsultation?.()} aria-label="Đóng"><i data-feather="x"></i></button>
      <div className="modal-content">
        <span className="modal-kicker">HỖ TRỢ CHỌN SẢN PHẨM</span>
        <h2 id="consult-title">Bạn đang quan tâm điều gì nhất?</h2>
        <p>Chọn một nhu cầu để lọc nhanh nhóm sản phẩm tham khảo.</p>
        <div className="consult-grid">
          <button className="consult-option" type="button" data-consult="tri-mun-kiem-dau" data-label="Da dầu & mụn"><strong>Da dầu & mụn</strong><span>Dầu thừa, bít tắc, sau mụn</span></button>
          <button className="consult-option" type="button" data-consult="cap-am-chuyen-sau" data-label="Khô & thiếu ẩm"><strong>Khô & thiếu ẩm</strong><span>Căng rát, bong tróc, thiếu nước</span></button>
          <button className="consult-option" type="button" data-consult="phuc-hoi-diu-da" data-label="Phục hồi & làm dịu"><strong>Phục hồi & làm dịu</strong><span>Da nhạy cảm, đỏ rát, yếu</span></button>
          <button className="consult-option" type="button" data-consult="sang-da-mo-tham" data-label="Sắc tố & lão hóa"><strong>Sắc tố & lão hóa</strong><span>Không đều màu, nếp nhăn</span></button>
        </div>
        <div id="consultation-result" className="recommendation hidden"></div>
        <div className="consent-box"><i data-feather="info"></i><span>Gợi ý chỉ mang tính tham khảo. Với tình trạng viêm hoặc kích ứng kéo dài, hãy gặp bác sĩ da liễu.</span></div>
        <a id="consultation-cta" className="btn btn--primary btn--full is-disabled" href="/products" aria-disabled="true">Chọn một nhu cầu để xem sản phẩm theo yêu cầu</a>
      </div>
    </div>
  </div>
  <div id="policy-modal" className="modal" role="dialog" aria-modal="true" aria-labelledby="policy-title">
    <div className="modal-panel">
      <button className="modal-close" type="button" onClick={(event) => window?.closePolicy?.()} aria-label="Đóng"><i data-feather="x"></i></button>
      <div id="policy-content" className="modal-content"></div>
    </div>
  </div>
</div>
    </>
  );
}
