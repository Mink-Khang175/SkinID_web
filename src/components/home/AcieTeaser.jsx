import { assetUrl } from '../../assets/index.js';

export default function AcieTeaser() {
  return (
    <section id="acie-teaser" className="section acie-teaser-section py-12 md:py-20 bg-white">
      <div className="container">
        <div className="relative rounded-3xl bg-gradient-to-br from-rose-50/50 via-white to-rose-50/30 border border-rose-100/80 p-6 sm:p-10 md:p-14 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Visual Panel: Cận cảnh làn da căng bóng chuẩn lab */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[360px] aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-b from-rose-100/40 to-white shadow-sm border border-rose-100">
                <img
                  src={assetUrl('/images/banners/ai-skin-model-v1.png')}
                  alt="Công nghệ soi da đa tầng Acie AI"
                  className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/90 backdrop-blur-xs text-gray-800 shadow-2xs">
                    Next-Gen Dermatological Vision
                  </span>
                </div>
              </div>
            </div>

            {/* Editorial Content: Tối giản, không gạch đầu dòng, không số liệu ảo */}
            <div className="lg:col-span-7 flex flex-col items-start justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-rose-800 text-[11px] font-bold tracking-widest uppercase mb-4">
                <span>SKINID x ACIE VISION</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-[10px] font-semibold text-rose-700">SẮP RA MẮT</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
                Đón Đầu Kỷ Nguyên Soi Da Phân Tầng AI.
              </h2>

              <p className="text-sm sm:text-base text-gray-600 mt-4 leading-relaxed max-w-xl">
                Sự kết hợp đột phá giữa thị giác máy tính thế hệ mới từ đối tác Acie và dữ liệu lâm sàng da liễu chuẩn quốc tế, giúp thấu suốt từng tầng vi điểm và cá nhân hóa phác đồ chuẩn xác cho từng làn da.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className="acie-teaser-btn px-6 py-3 rounded-full text-xs sm:text-sm font-bold !text-white bg-gradient-to-r from-[#FF5277] to-[#E85D75] hover:from-[#E85D75] hover:to-[#D44C64] transition-all duration-200 shadow-md shadow-rose-300/40 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
                  style={{ color: '#ffffff' }}
                  onClick={() => {
                    if (window.openConsultation) {
                      window.openConsultation();
                    } else {
                      window.showToast?.('Cảm ơn bạn! Hệ thống đã ghi nhận đăng ký trải nghiệm công nghệ Acie sớm nhất.');
                    }
                  }}
                >
                  <span style={{ color: '#ffffff' }}>Đăng ký trải nghiệm sớm</span>
                  <svg style={{ color: '#ffffff', stroke: '#ffffff' }} className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
                <span className="text-xs text-gray-500 font-medium">
                  Ưu tiên 500 suất trải nghiệm đầu tiên tại TP.HCM & Hà Nội
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
