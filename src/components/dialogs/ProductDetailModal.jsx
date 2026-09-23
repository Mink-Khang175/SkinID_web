export default function ProductDetailModal() {
  return (
    <>
      <div id="product-detail-modal" className="hidden opacity-0" onClick={(event) => { if (event.target === event.currentTarget) window.closeProductDetailModal?.(); }}>
        <div id="product-detail-modal-content" className="scale-95 opacity-0">
          <div className="pmodal-scroll">
            <button className="modal-close" type="button" onClick={(event) => window?.closeProductDetailModal?.()} aria-label="Đóng">
              <i data-feather="x"></i>
            </button>
            <div className="pmodal-head">
              <div className="pmodal-image">
                <img id="pmodal-img" alt="" />
              </div>
              <div>
                <span id="pmodal-line" className="modal-kicker"></span>
                <h2 id="pmodal-title"></h2>
                <div className="pmodal-price">
                  <span id="pmodal-price"></span>
                  <span id="pmodal-original-price" className="hidden"></span>
                </div>
                <p id="pmodal-uses"></p>
                <div className="spec">
                  <h4>Dung tích</h4>
                  <p id="pmodal-volume"></p>
                  <h4>Hướng dẫn sử dụng</h4>
                  <p id="pmodal-usage"></p>
                </div>
              </div>
            </div>
            <div className="spec">
              <h4>Thành phần nổi bật</h4>
              <div id="pmodal-key-actives"></div>
            </div>
            <section className="spec">
              <h4>Danh sách thành phần đầy đủ</h4>
              <p id="pmodal-full-ingredients"></p>
            </section>
            <div className="spec">
              <h4>Thông tin sản phẩm & Chứng nhận pháp lý</h4>
              <p id="pmodal-certification-text"></p>
            </div>
          </div>
          <div className="pmodal-actions">
            <button className="btn btn--outline" type="button" onClick={(event) => window?.closeProductDetailModal?.()}>Tiếp tục xem</button>
            <button id="pmodal-add-cart-btn" className="btn btn--primary" type="button">
              <i data-feather="shopping-bag"></i> Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

