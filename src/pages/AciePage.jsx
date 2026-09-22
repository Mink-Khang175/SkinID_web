import { useState } from 'react';
import { assetUrl } from '../assets/index.js';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import ProductDetailModal from '../components/dialogs/ProductDetailModal.jsx';
import useLegacyApplication from '../hooks/useLegacyApplication.js';
import usePageMetadata from '../hooks/usePageMetadata.js';

export default function AciePage() {
  usePageMetadata({
    title: 'SKINID x ACIE VISION — Công Nghệ Soi Da Cảm Biến Sinh Học Đột Phá',
    description: 'Trải nghiệm công nghệ soi da thế hệ mới Acie® Deeply Personalized Skincare™ từ Boston & Thung lũng Silicon với cảm biến sinh học Biosensor và thị giác máy tính AI đa tầng.'
  });

  useLegacyApplication('acie');

  const [activeStep, setActiveStep] = useState(0);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'hcm',
    preferredTime: 'morning'
  });

  const clinicalSteps = [
    {
      step: 'Bước 01',
      title: 'Chụp ảnh thị giác 3 góc đa chiều',
      desc: 'Hệ thống Acie Vision trên iPad A16 tự động quét khuôn mặt ở 3 góc: chính diện, nghiêng trái và nghiêng phải, định vị 68 điểm mốc giải phẫu da liễu.',
      img: '/images/acie/acie-app-scan-3angles.png',
      tag: 'Computer Vision AI'
    },
    {
      step: 'Bước 02',
      title: 'Đo cảm biến sinh học tại 3 điểm',
      desc: 'Nhấc thiết bị Acie Biosensor và chạm nhẹ vào má trái, má phải và trán. 4 điện cực vàng vi điểm đo trực tiếp trở kháng và độ ẩm tầng sâu stratum corneum.',
      img: '/images/acie/acie-app-sensor-measurement.png',
      tag: '4-Point Gold Biosensor'
    },
    {
      step: 'Bước 03',
      title: 'Báo cáo phân tầng & Chỉ số sinh học',
      desc: 'Hệ sinh thái AI tổng hợp biểu đồ sức khỏe da đa tầng: hàng rào lipid, tình trạng mất nước qua biểu bì (TEWL), mức độ nhạy cảm và nguy cơ sắc tố.',
      img: '/images/acie/acie-app-diagnostic-results.png',
      tag: 'Multi-Layer Diagnostics'
    },
    {
      step: 'Bước 04',
      title: 'Logic ghép cặp thành phần hoạt tính',
      desc: 'Phân tích khoa học giải thích chính xác lý do làn da cần những hoạt chất cụ thể (Niacinamide, Hyaluronic đa phân tử, Ceramide...) theo từng giai đoạn.',
      img: '/images/acie/acie-app-ingredient-logic.png',
      tag: 'Active Ingredient Logic'
    },
    {
      step: 'Bước 05',
      title: 'Cá nhân hóa phác đồ Rilastil & Xuất PDF',
      desc: 'Thiết lập chu trình dưỡng da chuẩn y khoa Sáng & Tối kết hợp sản phẩm Rilastil Ý, tự động xuất báo cáo chi tiết gửi về hòm thư điện tử của bạn.',
      img: '/images/acie/acie-app-morning-routine.png',
      tag: 'Clinical AM/PM Regimen'
    }
  ];

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      if (window.showToast) {
        window.showToast('Vui lòng điền đầy đủ Họ tên và Số điện thoại.', 'error');
      }
      return;
    }
    setBookingStatus('success');
    if (window.showToast) {
      window.showToast('Đăng ký trải nghiệm Acie thành công! Chuyên viên SkinID sẽ liên hệ xác nhận lịch hẹn.');
    }
  };

  return (
    <>
      <Header />
      <main id="acie-landing" className="min-h-screen bg-neutral-950 text-slate-100 font-sans selection:bg-[#FF4D30] selection:text-white">
        
        {/* TOP ACCENT BADGE */}
        <div className="w-full bg-gradient-to-r from-neutral-900 via-[#1A1A24] to-neutral-900 border-b border-white/10 py-2.5 px-4 text-center">
          <div className="container mx-auto flex items-center justify-center gap-2 text-xs font-medium tracking-wider text-rose-300">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF4D30] animate-ping" />
            <span className="uppercase text-white font-semibold tracking-widest">HỢP TÁC CHIẾN LƯỢC:</span>
            <span className="text-gray-300">SkinID.vn phân phối công nghệ trải nghiệm Acie® tại Việt Nam</span>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#FF4D30]/15 via-rose-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
          <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Top Badges & Trust Pillars */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#FF4D30]/15 text-[#FF6E54] border border-[#FF4D30]/30 shadow-sm">
                US Patented Tech
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/10 text-gray-300 border border-white/10">
                Pre-Seed by Google &amp; Silicon Valley VCs
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/10 text-gray-300 border border-white/10">
                Boston, USA • Est. 2023
              </span>
            </div>

            {/* Headline */}
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img
                  src={assetUrl('/images/acie/acie-logo-mark.png')}
                  alt="Acie Logo"
                  className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md"
                />
                <h2 className="text-sm md:text-base font-bold uppercase tracking-[0.25em] text-[#FF6E54]">
                  Acie® Deeply Personalized Skincare™
                </h2>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
                Công Nghệ Soi Da Cảm Biến Sinh Học &amp; AI Phân Tầng.
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto mb-10">
                Vượt xa những camera soi da thông thường. Acie kết hợp điện cực cảm biến sinh học đo sâu vi mô cùng thị giác máy tính, mở khóa phác đồ da liễu chính xác chuẩn y khoa.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#acie-booking"
                  className="px-8 py-4 rounded-full font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#FF4D30] to-[#E03A1E] hover:from-[#FF5D42] hover:to-[#EB4A2F] transition-all shadow-lg shadow-[#FF4D30]/25 hover:shadow-xl hover:shadow-[#FF4D30]/40 hover:-translate-y-0.5 inline-flex items-center gap-2.5"
                >
                  <i data-feather="calendar" className="w-4 h-4 text-white"></i>
                  <span>Đăng ký trải nghiệm tại Station</span>
                </a>
                <a
                  href="#acie-protocol"
                  className="px-7 py-4 rounded-full font-semibold text-sm sm:text-base text-gray-200 bg-white/5 hover:bg-white/10 border border-white/15 transition-all hover:text-white inline-flex items-center gap-2"
                >
                  <i data-feather="play-circle" className="w-4 h-4"></i>
                  <span>Quy trình 3 bước chuẩn y tế</span>
                </a>
              </div>
            </div>

            {/* HERO PRODUCT SHOWCASE - HARDWARE RENDERS */}
            <div className="mt-16 md:mt-24 max-w-5xl mx-auto">
              <div className="relative rounded-3xl bg-gradient-to-b from-neutral-900/90 via-neutral-900/50 to-neutral-950 border border-white/10 p-6 sm:p-10 md:p-12 overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Left: Device Pebble (Front & Back Views) */}
                  <div className="md:col-span-6 flex flex-col items-center justify-center">
                    <div className="text-center mb-4">
                      <span className="text-[10px] font-bold tracking-widest text-[#FF6E54] uppercase bg-[#FF4D30]/10 border border-[#FF4D30]/20 px-3 py-1 rounded-full">
                        Ergonomic Biosensor Pebble
                      </span>
                      <h3 className="text-xl font-bold text-white mt-2">Thiết Bị Cảm Biến Acie®</h3>
                      <p className="text-xs text-gray-400 mt-1">Đo trực tiếp qua 4 cực vàng siêu dẫn trên bề mặt da</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                      {/* Front View */}
                      <div className="group rounded-2xl bg-neutral-950/80 border border-white/10 p-4 flex flex-col items-center text-center transition-all hover:border-[#FF4D30]/40">
                        <div className="w-full aspect-[4/3] flex items-center justify-center overflow-hidden mb-3">
                          <img
                            src={assetUrl('/images/acie/acie-device-front.png')}
                            alt="Mặt trước thiết bị Acie - Logo Acie & Nút Power"
                            className="max-h-28 object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-200">Mặt trước</span>
                        <span className="text-[10px] text-gray-400">Logo gương &amp; Phím nguồn</span>
                      </div>

                      {/* Back View with Biosensor */}
                      <div className="group rounded-2xl bg-neutral-950/80 border border-white/10 p-4 flex flex-col items-center text-center transition-all hover:border-[#FF4D30]/40 relative overflow-hidden">
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <div className="w-full aspect-[4/3] flex items-center justify-center overflow-hidden mb-3">
                          <img
                            src={assetUrl('/images/acie/acie-device-back.png')}
                            alt="Mặt sau thiết bị Acie - Cảm biến Biosensor 4 cực vàng"
                            className="max-h-28 object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-200">Mặt sau Biosensor</span>
                        <span className="text-[10px] text-gray-400">4 cực vàng &amp; Đèn tín hiệu</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Đèn LED thông minh</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span>Âm báo bíp phản hồi</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Retail Station Setup */}
                  <div className="md:col-span-6 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-sm rounded-2xl bg-neutral-950/80 border border-white/10 p-5 overflow-hidden flex flex-col items-center">
                      <div className="w-full text-center mb-3">
                        <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-500/20 px-3 py-0.5 rounded-full">
                          In-Store Station
                        </span>
                        <h4 className="text-base font-bold text-white mt-1.5">Acie® Retail Station</h4>
                        <p className="text-xs text-gray-400">iPad A16 + Giá đỡ tích hợp sạc từ tính do Acie thiết kế</p>
                      </div>

                      <div className="w-full flex items-center justify-center py-2">
                        <img
                          src={assetUrl('/images/acie/acie-retail-station.png')}
                          alt="Acie Retail Station iPad A16"
                          className="max-h-56 object-contain drop-shadow-2xl"
                        />
                      </div>

                      <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-[11px] text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <i data-feather="check" className="w-3.5 h-3.5 text-[#FF6E54]"></i>
                          <span>Thời gian đo: 90 giây</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <i data-feather="check" className="w-3.5 h-3.5 text-[#FF6E54]"></i>
                          <span>Kết quả lâm sàng tức thì</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <i data-feather="check" className="w-3.5 h-3.5 text-[#FF6E54]"></i>
                          <span>Độ phân giải da đa tầng</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <i data-feather="check" className="w-3.5 h-3.5 text-[#FF6E54]"></i>
                          <span>Đồng bộ báo cáo PDF</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FOUNDERS & PEDIGREE SECTION */}
        <section className="py-16 md:py-24 bg-neutral-900/60 border-y border-white/10 relative">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-5 relative">
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 p-2 shadow-xl">
                  <img
                    src={assetUrl('/images/acie/acie-founders.png')}
                    alt="Acie Founders: Flora Bui & Dr. David Botequim, PhD"
                    className="w-full h-auto object-cover rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-[#FF4D30] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-lg">
                  Boston • USA
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6E54] tracking-widest uppercase mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D30]"></span>
                  <span>THE FOUNDING TEAM</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                  Sáng lập bởi các chuyên gia &amp; nhà khoa học hàng đầu nước Mỹ.
                </h2>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 font-light">
                  Thành lập năm 2023 tại Boston, Mỹ, Acie® ra đời từ tâm huyết kết hợp giữa kỹ thuật y sinh hiện đại và thực hành da liễu lâm sàng chuẩn quốc tế. Dự án nhanh chóng nhận vốn Pre-Seed từ Google và các quỹ đầu tư danh tiếng tại Silicon Valley.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-950 border border-white/10">
                    <h3 className="text-base font-bold text-white">Flora Bui</h3>
                    <p className="text-xs text-[#FF6E54] font-medium mt-0.5">Inventor &amp; CEO</p>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Nghiên cứu sinh Tiến sĩ (PhD Candidate) ngành Kỹ thuật &amp; Khoa học Ứng dụng tại CU Denver (Mỹ). Tác giả nhiều phát minh công nghệ da liễu.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-white/10">
                    <h3 className="text-base font-bold text-white">Dr. David Botequim, PhD</h3>
                    <p className="text-xs text-[#FF6E54] font-medium mt-0.5">Cofounder &amp; Chief Medical Officer</p>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      17 năm nghiên cứu chuyên sâu trong lĩnh vực Công nghệ sinh học &amp; Da liễu y khoa (Biotech &amp; Dermatology), dẫn dắt các phác đồ lâm sàng.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3-STEP CLINICAL PROTOCOL SECTION */}
        <section id="acie-protocol" className="py-16 md:py-28 relative">
          <div className="container mx-auto px-4 max-w-6xl">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold tracking-widest text-[#FF6E54] uppercase bg-[#FF4D30]/10 border border-[#FF4D30]/20 px-3.5 py-1 rounded-full">
                QUY TRÌNH LÂM SÀNG
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-4 mb-3">
                Đo da — Đọc kết quả — Tư vấn liệu trình cá nhân hóa
              </h2>
              <p className="text-sm sm:text-base text-gray-300 font-light">
                Trải nghiệm 5 chặng quy chuẩn được thiết kế bởi Acie tại Retail Station, hoàn thiện chỉ trong vòng 2 phút.
              </p>
            </div>

            {/* Step selector tabs */}
            <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
              {clinicalSteps.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    activeStep === idx
                      ? 'bg-[#FF4D30] text-white shadow-md shadow-[#FF4D30]/30'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-gray-400 hover:text-gray-200 border border-white/10'
                  }`}
                >
                  <span>{s.step}</span>
                  <span className="hidden sm:inline opacity-70 font-normal">| {s.tag}</span>
                </button>
              ))}
            </div>

            {/* Active Step Showcase Card */}
            <div className="rounded-3xl bg-neutral-900/80 border border-white/10 p-6 sm:p-10 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left: Interactive screenshot / screen visual */}
                <div className="lg:col-span-7">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 p-2 shadow-inner">
                    <div className="aspect-[16/10] w-full flex items-center justify-center bg-neutral-950 rounded-xl overflow-hidden">
                      <img
                        src={assetUrl(clinicalSteps[activeStep].img)}
                        alt={clinicalSteps[activeStep].title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gray-300 border border-white/10">
                      Acie Retail Interface v2.6
                    </div>
                  </div>
                </div>

                {/* Right: Explanatory details */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6E54] tracking-widest uppercase mb-2">
                    <span>{clinicalSteps[activeStep].step}</span>
                    <span>•</span>
                    <span>{clinicalSteps[activeStep].tag}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-4">
                    {clinicalSteps[activeStep].title}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-6 font-light">
                    {clinicalSteps[activeStep].desc}
                  </p>

                  <div className="p-4 rounded-xl bg-neutral-950/70 border border-white/10 text-xs text-gray-300 space-y-2">
                    <div className="flex items-center gap-2 text-gray-200 font-semibold">
                      <i data-feather="cpu" className="w-3.5 h-3.5 text-[#FF6E54]"></i>
                      <span>Độ chuẩn xác cấp độ lâm sàng</span>
                    </div>
                    <p className="text-gray-400">
                      Hệ thống đối chiếu trực tiếp dữ liệu da với danh mục hoạt chất của Dược mỹ phẩm Rilastil (Ý), giúp chọn đúng nồng độ và sản phẩm an toàn nhất cho làn da bạn.
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-gray-300 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      ← Bước trước
                    </button>
                    <span className="text-xs text-gray-500 font-mono">
                      {activeStep + 1} / {clinicalSteps.length}
                    </span>
                    <button
                      type="button"
                      disabled={activeStep === clinicalSteps.length - 1}
                      onClick={() => setActiveStep(prev => Math.min(clinicalSteps.length - 1, prev + 1))}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#FF4D30] hover:bg-[#E03A1E] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Bước tiếp theo →
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 4 CORE ECOSYSTEM PILLARS */}
        <section className="py-16 md:py-24 bg-neutral-900/40 border-t border-white/10">
          <div className="container mx-auto px-4 max-w-6xl">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold tracking-widest text-[#FF6E54] uppercase bg-[#FF4D30]/10 border border-[#FF4D30]/20 px-3.5 py-1 rounded-full">
                HỆ SINH THÁI TOÀN DIỆN
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-4 mb-3">
                Thấu suốt làn da ở mọi thời điểm
              </h2>
              <p className="text-sm sm:text-base text-gray-300 font-light">
                Với Acie, bạn không chỉ được đo da một lần tại store, mà còn sở hữu một trợ lý khoa học đồng hành cùng chu trình skincare mỗi ngày.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Pillar 1 */}
              <div className="rounded-2xl bg-neutral-950 border border-white/10 p-6 flex flex-col justify-between hover:border-[#FF4D30]/40 transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#FF4D30]/15 flex items-center justify-center text-[#FF6E54] mb-4">
                    <i data-feather="activity" className="w-5 h-5"></i>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Phân tích chuyên sâu</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Theo dõi sức khỏe da đa tầng, phát hiện sớm tình trạng tổn thương vi điểm, khô bề mặt và dấu hiệu lão hóa tiềm ẩn.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Deep Monitoring</span>
                  <span className="text-[#FF6E54] font-semibold">01</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-2xl bg-neutral-950 border border-white/10 p-6 flex flex-col justify-between hover:border-[#FF4D30]/40 transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 mb-4">
                    <i data-feather="message-square" className="w-5 h-5"></i>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Trợ lý AI — Ms. Acie™</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Trò chuyện trực tiếp với làn da của bạn: "Talk to your own skin". Giải đáp tức thì về phản ứng hoạt chất và cách điều chỉnh routine.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                  <span>AI Companion</span>
                  <span className="text-purple-400 font-semibold">02</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-2xl bg-neutral-950 border border-white/10 p-6 flex flex-col justify-between hover:border-[#FF4D30]/40 transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 mb-4">
                    <i data-feather="sliders" className="w-5 h-5"></i>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Tối ưu hóa chu trình</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Chu trình chăm sóc da tự động thích ứng linh hoạt theo thời tiết, mức độ ô nhiễm UV và thể trạng da từng ngày.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Dynamic Routine</span>
                  <span className="text-blue-400 font-semibold">03</span>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="rounded-2xl bg-neutral-950 border border-white/10 p-6 flex flex-col justify-between hover:border-[#FF4D30]/40 transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-4">
                    <i data-feather="shield-check" className="w-5 h-5"></i>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Ghép đôi Dược mỹ phẩm</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Liên kết trực tiếp với các dòng điều trị chuyên sâu từ Rilastil (Ý), đảm bảo tính an toàn và dược tính chuẩn lâm sàng.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Rilastil Pairing</span>
                  <span className="text-emerald-400 font-semibold">04</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* IN-STORE BOOKING FORM SECTION */}
        <section id="acie-booking" className="py-20 md:py-28 relative">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/15 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF4D30]/10 blur-3xl pointer-events-none rounded-full" />

              <div className="text-center max-w-xl mx-auto mb-10 relative z-10">
                <span className="text-xs font-bold tracking-widest text-[#FF6E54] uppercase bg-[#FF4D30]/10 border border-[#FF4D30]/20 px-3.5 py-1 rounded-full">
                  TRẢI NGHIỆM MIỄN PHÍ TẠI STORE
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-4 mb-2">
                  Đặt Lịch Soi Da Công Nghệ Acie®
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 font-light">
                  Chuyên viên SkinID sẽ chuẩn bị sẵn thiết bị Acie Biosensor và phác đồ phân tích chuyên sâu dành riêng cho bạn.
                </p>
              </div>

              {bookingStatus === 'success' ? (
                <div className="p-8 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-center max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <i data-feather="check-circle" className="w-6 h-6"></i>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Đăng Ký Thành Công!</h3>
                  <p className="text-xs text-gray-300 mb-6 leading-relaxed">
                    Hệ thống SkinID đã ghi nhận thông tin của bạn ({formData.name} - {formData.phone}). Chuyên viên sẽ liên hệ trước 30 phút để hỗ trợ đón tiếp bạn tại Station.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingStatus(null);
                      setFormData({ name: '', phone: '', city: 'hcm', preferredTime: 'morning' });
                    }}
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all"
                  >
                    Đăng ký thêm lịch hẹn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="max-w-xl mx-auto space-y-4 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="acie-name" className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Họ và tên <span className="text-[#FF4D30]">*</span>
                      </label>
                      <input
                        id="acie-name"
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:outline-hidden focus:border-[#FF4D30] transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="acie-phone" className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Số điện thoại / Zalo <span className="text-[#FF4D30]">*</span>
                      </label>
                      <input
                        id="acie-phone"
                        type="tel"
                        required
                        placeholder="09xx xxx xxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:outline-hidden focus:border-[#FF4D30] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="acie-city" className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Điểm trải nghiệm Station
                      </label>
                      <select
                        id="acie-city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:outline-hidden focus:border-[#FF4D30] transition-colors"
                      >
                        <option value="hcm">TP. Hồ Chí Minh (Store Flagship)</option>
                        <option value="hanoi">Hà Nội (Điểm đối tác SkinID)</option>
                        <option value="dalat">Đà Lạt (Trạm trải nghiệm)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="acie-time" className="block text-xs font-semibold text-gray-300 mb-1.5">
                        Khung giờ thuận tiện
                      </label>
                      <select
                        id="acie-time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:outline-hidden focus:border-[#FF4D30] transition-colors"
                      >
                        <option value="morning">Buổi sáng (09:00 - 12:00)</option>
                        <option value="afternoon">Buổi chiều (13:30 - 17:30)</option>
                        <option value="evening">Buổi tối (18:00 - 21:00)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#FF4D30] to-[#E03A1E] hover:from-[#FF5D42] hover:to-[#EB4A2F] transition-all shadow-lg shadow-[#FF4D30]/25 hover:shadow-xl hover:shadow-[#FF4D30]/40 cursor-pointer"
                    >
                      Xác Nhận Đặt Lịch Soi Da Acie® Miễn Phí
                    </button>
                    <p className="text-[11px] text-gray-400 text-center mt-3">
                      Cam kết bảo mật 100% dữ liệu hình ảnh và số đo sinh học theo chuẩn y tế HIPAA/GDPR.
                    </p>
                  </div>
                </form>
              )}

            </div>
          </div>
        </section>

        {/* CLOSING BANNER & BACK TO STORE */}
        <section className="py-12 border-t border-white/10 bg-neutral-950">
          <div className="container mx-auto px-4 max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={assetUrl('/images/acie/acie-logo-mark.png')}
                alt="Acie Mark"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h4 className="text-sm font-bold text-white">SkinID.vn x Acie® Deeply Personalized Skincare™</h4>
                <p className="text-xs text-gray-400">Tiêu chuẩn chăm sóc da công nghệ cao từ Boston, USA</p>
              </div>
            </div>
            <a
              href="/"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all whitespace-nowrap"
            >
              ← Trở về Trang chủ SkinID
            </a>
          </div>
        </section>

      </main>

      <Footer />
      <MobileNav />
      <StorefrontModals />
      <ProductDetailModal />
    </>
  );
}
