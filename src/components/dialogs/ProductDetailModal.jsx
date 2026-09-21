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
              
              {/* Official First Page of TEMPLATE FOR NOTIFICATION OF COSMETIC PRODUCT */}
              <div id="pmodal-license-container" className="mt-4 hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-rose-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span className="text-xs font-bold text-gray-800 tracking-tight uppercase">TEMPLATE FOR NOTIFICATION OF COSMETIC PRODUCT</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">Trang 1 / Bản tiếp nhận Bộ Y Tế</span>
                </div>
                <div className="pmodal-license-preview relative rounded-xl border border-gray-200/90 bg-gray-50/70 p-2 shadow-2xs group cursor-zoom-in overflow-hidden transition-all hover:border-gray-400" onClick={() => window.openLicenseModal?.()} title="Bấm để phóng to xem rõ nét trang 1">
                  <div className="relative w-full overflow-hidden rounded-lg bg-white shadow-xs border border-gray-100 flex justify-center">
                    <img id="pmodal-license-img" src="" alt="TEMPLATE FOR NOTIFICATION OF COSMETIC PRODUCT - Trang 1" className="w-full h-auto max-h-[460px] object-contain transition-transform duration-200 group-hover:scale-[1.01]" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 backdrop-blur-xs text-white text-xs px-3.5 py-1.5 rounded-full font-medium shadow-md flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        Phóng to xem chi tiết
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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

      {/* Lightbox Zoom Modal for Page 1 of Notification Template */}
      <div id="license-preview-modal" className="fixed inset-0 z-[130] hidden bg-black/80 backdrop-blur-xs items-center justify-center p-3 sm:p-6" onClick={(event) => { if (event.target === event.currentTarget) window.closeLicenseModal?.(); }}>
        <div className="relative max-w-3xl w-full max-h-[94vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100 bg-gray-50/90">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-tight truncate">TEMPLATE FOR NOTIFICATION OF COSMETIC PRODUCT</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full flex-shrink-0">Bộ Y Tế</span>
            </div>
            <button type="button" onClick={() => window.closeLicenseModal?.()} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors flex-shrink-0" aria-label="Đóng phóng to">
              ✕
            </button>
          </div>
          <div className="p-3 sm:p-4 overflow-auto max-h-[calc(94vh-56px)] flex justify-center bg-gray-100/60">
            <img id="license-modal-img" src="" alt="Phiếu công bố sản phẩm mỹ phẩm" className="max-w-full h-auto rounded shadow-sm border border-gray-200" />
          </div>
        </div>
      </div>
    </>
  );
}

