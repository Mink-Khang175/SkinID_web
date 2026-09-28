import { useEffect, useMemo, useState } from 'react';
import { assetUrl } from '../../../assets/index.js';
import { useCart } from '../../cart/index.js';
import { resolveScanRoutine } from '../services/routineResolver.js';
import { exportUserPdfReport } from '../services/profilePdfExport.js';
import { detailedMetricNames } from '../services/metricNames.js';

const adviceByMetric = {
  moisture: {
    name: 'Độ ẩm bề mặt',
    why: 'Hàng rào lipid lớp sừng suy yếu làm nước bốc hơi nhanh, khiến da thô ráp và giảm độ căng mọng.',
    shouldDo: 'Ưu tiên Hyaluronic Acid, Panthenol và kem dưỡng giàu Ceramide để cấp và khóa ẩm.',
    avoid: 'Tránh nước quá nóng và chất làm sạch sulfate mạnh làm mất màng acid bảo vệ da.'
  },
  sebum: {
    name: 'Kiểm soát bã nhờn',
    why: 'Tuyến bã nhờn có thể tăng hoạt động do thiếu nước bề mặt, hormone hoặc nhiệt độ môi trường.',
    shouldDo: 'Dùng Niacinamide 2–5%, BHA phù hợp và dưỡng ẩm dạng gel không gây bít tắc.',
    avoid: 'Tránh thấm dầu liên tục hoặc kem dưỡng quá nặng dễ gây phản ứng tiết dầu bù.'
  },
  pores: {
    name: 'Kích thước lỗ chân lông',
    why: 'Bã nhờn và tế bào chết làm giãn miệng nang lông; collagen nâng đỡ cũng suy giảm theo thời gian.',
    shouldDo: 'Làm sạch kép buổi tối, BHA định kỳ và Peptide hỗ trợ độ săn chắc.',
    avoid: 'Không tự cạy nặn hoặc dùng gel lột mạnh gây tổn thương thành nang lông.'
  },
  pigmentation: {
    name: 'Sắc tố & Sạm nám',
    why: 'Melanin tăng do tia UV hoặc tăng sắc tố sau viêm, làm màu da kém đồng đều.',
    shouldDo: 'Dùng chống nắng SPF 50+ và hoạt chất như Vitamin C, Tranexamic Acid hoặc Alpha Arbutin.',
    avoid: 'Tránh phơi nắng không che chắn và sản phẩm lột tẩy trắng cấp tốc.'
  },
  elasticity: {
    name: 'Độ đàn hồi & Săn chắc',
    why: 'Collagen và Elastin suy giảm do tuổi tác, stress oxy hóa và tác hại của gốc tự do.',
    shouldDo: 'Cân nhắc Retinoid phù hợp vào buổi tối và Peptide hỗ trợ nguyên bào sợi.',
    avoid: 'Hạn chế thức khuya và chế độ ăn nhiều đường gây đường hóa collagen.'
  }
};

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(Number(value) || 0);

function numberValue(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildMetrics(scan) {
  const raw = scan.metrics || {};
  const analysis = scan.fullAnalysis || {};
  const source = (key, fallback) => numberValue(raw[key] ?? analysis[key], fallback);
  const moistureRaw = source('moisture', 60);
  const sebumRaw = source('sebum', 60);
  const poresRaw = source('pores', 60);
  const pigmentationRaw = source('pigmentation', 50);
  const elasticityRaw = source('elasticity', 65);
  const healthScore = numberValue(scan.healthScore, 70);
  const moisture = moistureRaw;
  const sebum = Math.max(10, 100 - sebumRaw);
  const pores = Math.max(10, 100 - poresRaw);
  const pigmentation = Math.max(10, 100 - pigmentationRaw);
  const elasticity = elasticityRaw;

  return {
    health: [
      moisture,
      sebum,
      pores,
      pigmentation,
      source('melasma', Math.max(15, pigmentation - 10)),
      elasticity,
      source('eyeWrinkles', Math.round(elasticity * 0.95)),
      source('nasolabialFolds', Math.round(elasticity * 0.9)),
      source('redness', Math.round(moisture * 0.7 + 25)),
      source('acneBacteria', Math.round(sebum * 0.8 + 15)),
      source('texture', Math.round((moisture + pores) / 2)),
      source('darkCircles', Math.round((healthScore + pigmentation) / 2))
    ].map((value) => Math.min(100, Math.max(0, value))),
    core: [
      { id: 'moisture', rawScore: moistureRaw, healthScore: moisture },
      { id: 'sebum', rawScore: sebumRaw, healthScore: sebum },
      { id: 'pores', rawScore: poresRaw, healthScore: pores },
      { id: 'pigmentation', rawScore: pigmentationRaw, healthScore: pigmentation },
      { id: 'elasticity', rawScore: elasticityRaw, healthScore: elasticity }
    ]
  };
}

function metricTheme(score) {
  if (score >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'Tốt' };
  if (score >= 60) return { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'Khá' };
  if (score >= 40) return { bar: 'bg-amber-400', text: 'text-amber-600', label: 'Cần chú ý' };
  return { bar: 'bg-rose-500', text: 'text-rose-600', label: 'Cần cải thiện' };
}

function RadarChart({ values }) {
  const center = 150;
  const radius = 92;
  const point = (index, scale = 1) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / values.length);
    return [center + Math.cos(angle) * radius * scale, center + Math.sin(angle) * radius * scale];
  };
  const polygon = (scale) => values.map((_, index) => point(index, scale).join(',')).join(' ');
  const dataPolygon = values.map((value, index) => point(index, value / 100).join(',')).join(' ');

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full max-w-[340px]" role="img" aria-label="Biểu đồ radar mười hai chỉ số cấu trúc da">
      {[0.25, 0.5, 0.75, 1].map((scale) => <polygon key={scale} points={polygon(scale)} fill="none" stroke="#e5e7eb" strokeWidth="1" />)}
      {values.map((_, index) => {
        const [x, y] = point(index);
        return <line key={detailedMetricNames[index]} x1={center} y1={center} x2={x} y2={y} stroke="#eef0f2" />;
      })}
      <polygon points={dataPolygon} fill="rgba(232,122,144,0.24)" stroke="#E87A90" strokeWidth="2.5" />
      {values.map((value, index) => {
        const [x, y] = point(index, value / 100);
        const [labelX, labelY] = point(index, 1.3);
        return (
          <g key={`metric-${detailedMetricNames[index]}`}>
            <circle cx={x} cy={y} r="3.5" fill="#E87A90" stroke="#fff" strokeWidth="1.5" />
            <text x={labelX} y={labelY + 3} textAnchor="middle" className="fill-gray-600 text-[8px] font-bold">{detailedMetricNames[index]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SkincareRoutineSection({ scan }) {
  const { addToCart, openCart } = useCart();
  const [activeTab, setActiveTab] = useState('all');
  const [addedAll, setAddedAll] = useState(false);
  const routine = useMemo(() => resolveScanRoutine(scan), [scan]);
  const { products, morningSteps, eveningSteps } = routine;

  const buy = (product) => {
    if (!product?.id) return;
    addToCart(product.id, 1);
    openCart();
  };

  const buyAll = () => {
    products.forEach((p) => {
      if (p?.id) addToCart(p.id, 1);
    });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
    openCart();
  };

  const totalPrice = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h4 className="font-black text-gray-900 text-base sm:text-lg flex items-center gap-2">
            <span>Phác Đồ Chăm Sóc Da Cá Nhân Hóa</span>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-brand-blush text-brand-primary border border-brand-petal">Chuẩn Y Khoa</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">Phác đồ 6 bước (Sáng & Tối) được thiết kế riêng theo kết quả phân tích làn da của phiên này.</p>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100/90 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Tất cả 6 bước
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('morning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'morning' ? 'bg-white text-[#C45E28] shadow-xs' : 'text-gray-500 hover:text-[#C45E28]'}`}
          >
            ☀️ Buổi sáng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evening')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'evening' ? 'bg-white text-[#8B3D59] shadow-xs' : 'text-gray-500 hover:text-[#8B3D59]'}`}
          >
            🌙 Buổi tối
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {(activeTab === 'all' || activeTab === 'morning') && (
          <div className="bg-gradient-to-br from-[#FFF9F6] via-[#FFFAF7] to-white border border-[#FFE6D9] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#FFE2D1] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#FFEADF] text-[#C45E28] flex items-center justify-center text-xs">☀️</span>
                <h5 className="font-bold text-[#C45E28] text-xs sm:text-sm uppercase tracking-wide">Buổi Sáng · Bảo Vệ & Cấp Ẩm</h5>
              </div>
              <span className="text-[11px] font-semibold text-[#D17646]">3 bước</span>
            </div>

            <div className="space-y-3">
              {morningSteps.map((s) => (
                <div key={`m-${s.step}`} className="bg-white rounded-xl p-3 border border-[#FFE9DE] shadow-2xs hover:border-[#FFD0BC] transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#FFEAE0] text-[#C45E28] font-black text-[10px] flex items-center justify-center flex-shrink-0">{s.step}</span>
                    <strong className="text-xs font-bold text-gray-800">{s.title}</strong>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-2 pl-7 leading-relaxed">{s.desc}</p>
                  {s.product && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FFF9F7] border border-[#FFEADA] ml-7">
                      <img src={assetUrl(s.product.image || '/images/products/placeholder.jpg', s.product.brandSlug)} alt="" className="w-11 h-11 rounded-lg object-contain bg-white p-1 border border-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-[#C45E28] uppercase">{s.product.brand || 'Rilastil'}</span>
                        <h6 className="text-[11px] font-bold text-gray-900 truncate">{s.product.name}</h6>
                        <span className="text-xs font-black text-[#C45E28]">{formatPrice(s.product.price)}</span>
                      </div>
                      <button type="button" onClick={() => buy(s.product)} className="px-2.5 py-1.5 bg-[#C45E28] hover:bg-[#A84A1A] text-white text-[11px] font-bold rounded-lg transition-colors flex-shrink-0 cursor-pointer">+ Thêm giỏ</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'evening') && (
          <div className="bg-gradient-to-br from-[#FDF8FB] via-[#FCF5F8] to-white border border-[#F3DCE5] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F2D7E2] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#F9E6EE] text-[#8B3D59] flex items-center justify-center text-xs">🌙</span>
                <h5 className="font-bold text-[#8B3D59] text-xs sm:text-sm uppercase tracking-wide">Buổi Tối · Phục Hồi & Tái Tạo</h5>
              </div>
              <span className="text-[11px] font-semibold text-[#9D4D6B]">3 bước</span>
            </div>

            <div className="space-y-3">
              {eveningSteps.map((s) => (
                <div key={`e-${s.step}`} className="bg-white rounded-xl p-3 border border-[#F6E1EB] shadow-2xs hover:border-[#EDB8CE] transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#FCE8F1] text-[#8B3D59] font-black text-[10px] flex items-center justify-center flex-shrink-0">{s.step}</span>
                    <strong className="text-xs font-bold text-gray-800">{s.title}</strong>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-2 pl-7 leading-relaxed">{s.desc}</p>
                  {s.product && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FDF7FA] border border-[#F4DEE7] ml-7">
                      <img src={assetUrl(s.product.image || '/images/products/placeholder.jpg', s.product.brandSlug)} alt="" className="w-11 h-11 rounded-lg object-contain bg-white p-1 border border-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-[#8B3D59] uppercase">{s.product.brand || 'Rilastil'}</span>
                        <h6 className="text-[11px] font-bold text-gray-900 truncate">{s.product.name}</h6>
                        <span className="text-xs font-black text-[#8B3D59]">{formatPrice(s.product.price)}</span>
                      </div>
                      <button type="button" onClick={() => buy(s.product)} className="px-2.5 py-1.5 bg-[#8B3D59] hover:bg-[#722F47] text-white text-[11px] font-bold rounded-lg transition-colors flex-shrink-0 cursor-pointer">+ Thêm giỏ</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-[#FFF1F4] via-[#FFF8F9] to-white border border-[#FFD0DB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block mb-0.5">Hiệu quả tái tạo tối ưu sau 28 ngày</span>
          <h5 className="font-bold text-sm text-gray-900">Trọn bộ {products.length} sản phẩm theo phác đồ</h5>
          <p className="text-xs font-bold text-brand-primary mt-0.5">Tổng phác đồ: <strong className="text-base font-black text-brand-dark">{formatPrice(totalPrice)}</strong></p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={buyAll}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#E06D81] to-[#C84564] hover:from-[#C84564] hover:to-[#B33553] text-white text-xs font-bold shadow-md shadow-rose-300/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span>{addedAll ? 'Đã thêm trọn bộ vào giỏ!' : 'Thêm trọn bộ vào giỏ hàng'}</span>
          </button>
          <a
            href="https://zalo.me/0924093461"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white border border-[#FFCCD5] text-[#8C4E5C] hover:bg-[#FFF5F7] text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
          >
            Gửi Dược Sĩ Tư Vấn
          </a>
        </div>
      </div>
    </section>
  );
}

export default function ProfileScanDetailModal({ history = [] }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const open = (event) => setSelected(event.detail || null);
    document.addEventListener('skinid:scan-detail-open', open);
    return () => document.removeEventListener('skinid:scan-detail-open', open);
  }, []);

  const selectedIndex = useMemo(() => {
    if (!selected) return -1;
    const byId = history.findIndex((scan) => scan.id != null && String(scan.id) === String(selected.scanId));
    return byId >= 0 ? byId : Number(selected.scanIndex);
  }, [history, selected]);
  const scan = selectedIndex >= 0 ? history[selectedIndex] : null;

  useEffect(() => {
    if (!scan) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [scan]);

  if (!scan) return null;

  const healthScore = Math.min(100, Math.max(10, numberValue(scan.healthScore, 70)));
  const grade = String(scan.overallGrade || (healthScore >= 75 ? 'A' : healthScore >= 60 ? 'B' : 'C')).toUpperCase();
  const gradeComment = scan.overallGradeComment || (grade === 'A'
    ? 'Làn da khỏe mạnh, cấu trúc ổn định'
    : grade === 'B' ? 'Làn da ở mức ổn định, cần duy trì chu trình' : 'Cần phác đồ phục hồi hàng rào bảo vệ');
  const analysis = scan.fullAnalysis || {};
  const assessment = scan.analysis3Angles || analysis.analysis3Angles || `Phân tích AI cho thấy chỉ số sức khỏe da đạt ${healthScore}/100.`;
  const metrics = buildMetrics(scan);
  const ranked = detailedMetricNames.map((name, index) => ({ name, score: metrics.health[index] })).sort((left, right) => left.score - right.score);
  const concerns = Array.isArray(scan.primaryConcerns) && scan.primaryConcerns.length ? scan.primaryConcerns : ['Niacinamide', 'Hyaluronic Acid', 'Ceramide'];
  const products = Array.isArray(scan.recommendedRoutineProducts) ? scan.recommendedRoutineProducts : [];
  const ringColor = healthScore < 60 ? '#ef4444' : healthScore < 75 ? '#f59e0b' : '#10b981';
  const close = () => setSelected(null);

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }} role="dialog" aria-modal="true" aria-labelledby="scan-detail-title">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col border border-gray-100 my-auto animate-fade-in">
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-20">
          <div><h3 id="scan-detail-title" className="font-black text-gray-900 text-base sm:text-lg">Phiên Soi Da #{history.length - selectedIndex}</h3><p className="text-xs text-gray-400">Thời gian: {scan.dateFormatted || 'Vừa xong'}</p></div>
          <button type="button" onClick={close} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 text-xl" aria-label="Đóng">×</button>
        </div>

        <div className="p-6 space-y-6 flex-grow">
          <div className="bg-gradient-to-br from-brand-blush/80 via-white to-brand-blush/30 border border-brand-petal shadow-sm rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path strokeWidth="3" stroke="#f3f4f6" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path strokeDasharray={`${healthScore}, 100`} strokeWidth="3" strokeLinecap="round" stroke={ringColor} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black text-brand-dark">{healthScore}</span><span className="text-[9px] text-gray-500 font-bold uppercase">Điểm da</span></div>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2"><h4 className="text-xl font-black text-gray-900">{scan.skinType || 'Da chưa xác định'}</h4><span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">Tuổi da AI: {scan.skinAge || 25} tuổi</span></div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200"><strong>{grade}</strong><span>{gradeComment}</span></div>
              <p className="text-xs text-gray-600 leading-relaxed pt-1">{assessment}</p>
            </div>
          </div>

          <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2 h-[300px] flex items-center justify-center"><RadarChart values={metrics.health} /></div>
              <div className="w-full md:w-1/2 space-y-3">
                <h4 className="font-bold text-gray-900 text-base">Cấu Trúc Đa Tầng Của Làn Da</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Vùng co vào tâm cho thấy chỉ số cần được ưu tiên trong chu trình chăm sóc.</p>
                {ranked.slice(0, 2).map((metric, index) => <div key={metric.name} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${index ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}><strong>{metric.name}</strong> ({metric.score}/100) cần được theo dõi.</div>)}
                <div className="flex flex-wrap gap-1.5">{concerns.map((concern) => <span key={concern} className="bg-brand-blush text-brand-primary text-[11px] font-bold px-2.5 py-1 rounded-full border border-brand-petal">{concern}</span>)}</div>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100"><h5 className="font-bold text-xs sm:text-sm text-gray-800 mb-3">Chi Tiết 12 Chỉ Số Cấu Trúc Đa Tầng</h5><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">{metrics.health.map((score, index) => { const theme = metricTheme(score); return <div key={detailedMetricNames[index]} className="space-y-1"><div className="flex justify-between text-xs"><span className="font-medium text-gray-700">{detailedMetricNames[index]}</span><strong className={theme.text}>{score}/100</strong></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`${theme.bar} h-1.5 rounded-full`} style={{ width: `${score}%` }}></div></div></div>; })}</div></div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <h4 className="font-bold text-gray-900 text-base mb-4">Đánh Giá Chi Tiết 5 Chỉ Số Cốt Lõi</h4>
            <div className="space-y-3">{metrics.core.map((metric) => { const preset = adviceByMetric[metric.id]; const custom = analysis.detailedAdvice?.[metric.id] || {}; const theme = metricTheme(metric.healthScore); return <details key={metric.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50"><summary className="p-3.5 cursor-pointer list-none flex items-center justify-between"><div><p className="font-bold text-gray-800 text-xs sm:text-sm">{preset.name}</p><p className={`${theme.text} text-[11px] font-semibold`}>{metric.rawScore}% · {theme.label}</p></div><span aria-hidden="true">⌄</span></summary><div className="border-t border-gray-100 bg-white p-3.5 text-xs space-y-2"><p><strong>Vì sao? </strong>{custom.why || preset.why}</p><p><strong>Nên làm: </strong>{custom.shouldDo || preset.shouldDo}</p><p><strong>Cần tránh: </strong>{custom.avoid || preset.avoid}</p></div></details>; })}</div>
          </section>

          <SkincareRoutineSection scan={scan} />
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportUserPdfReport({ scan })}
              className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <span>Xuất Báo Cáo PDF</span>
            </button>
            <a href="/skin-analysis" className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-brand-primary rounded-xl transition-colors">
              + Soi da mới
            </a>
          </div>
          <button type="button" onClick={close} className="px-5 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer">Đóng</button>
        </div>
      </div>
    </div>
  );
}
