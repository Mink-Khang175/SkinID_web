import { exportUserPdfReport } from '../services/profilePdfExport.js';

function scoreTheme(score) {
  if (score < 60) {
    return {
      score: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20',
      card: 'border-rose-200/80 hover:border-rose-400'
    };
  }
  if (score < 75) {
    return {
      score: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/20',
      card: 'border-amber-200/80 hover:border-amber-400'
    };
  }
  return {
    score: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20',
    card: 'border-emerald-200/80 hover:border-emerald-400'
  };
}

function openScanDetail(scanId, scanIndex) {
  document.dispatchEvent(new CustomEvent('skinid:scan-detail-open', { detail: { scanId, scanIndex } }));
}

export default function ProfileHistoryTimeline({ history = [] }) {
  if (!history.length) {
    return (
      <div id="timeline-scan-container" className="space-y-4">
        <div className="text-center py-7 text-gray-400">
          <div className="profile-empty-illustration mx-auto" aria-hidden="true">
            <span className="profile-empty-illustration__face"></span>
            <span className="profile-empty-illustration__spark profile-empty-illustration__spark--one">✦</span>
            <span className="profile-empty-illustration__spark profile-empty-illustration__spark--two">✦</span>
          </div>
          <p className="font-bold text-sm text-gray-700">Chưa có dữ liệu phiên soi da nào</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Hãy thực hiện soi da AI 3 góc để nhận phác đồ chăm sóc cá nhân hóa đầu tiên!</p>
          <a href="/skin-analysis" className="profile-btn profile-btn--primary">Bắt đầu Soi Da AI Ngay</a>
        </div>
      </div>
    );
  }

  return (
    <div id="timeline-scan-container" className="space-y-4">
      {history.map((scan, index) => {
        const score = Number(scan.healthScore) || 0;
        const scanId = scan.id ?? index;
        const theme = scoreTheme(score);
        const open = () => openScanDetail(scanId, index);
        return (
          <article
            key={scan.id || `${scan.dateFormatted || 'scan'}-${index}`}
            className={`p-5 sm:p-6 rounded-2xl border ${theme.card} transition-all bg-white shadow-sm hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer group`}
            onClick={open}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className={`${theme.score} w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                <span className="text-xl leading-none font-black">{score}</span>
                <span className="text-[9px] font-semibold tracking-wider opacity-90">ĐIỂM</span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-brand-primary transition-colors">Phiên Soi Da #{history.length - index}</h4>
                  {index === 0 && <span className="bg-rose-100/90 text-brand-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-200 uppercase tracking-wider">Mới nhất</span>}
                  <span className="text-xs font-bold text-brand-primary bg-brand-blush px-2.5 py-0.5 rounded-full">{scan.skinType || 'Chưa xác định'}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{scan.dateFormatted || 'Gần đây'} • Tuổi da AI: <strong className="text-gray-700">{scan.skinAge || '--'} tuổi</strong></p>
              </div>
            </div>

            <div className="action-group flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 flex-shrink-0" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => exportUserPdfReport({ scan })}
                className="px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Xuất báo cáo PDF phiên này"
              >
                <svg className="w-3.5 h-3.5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>Xuất PDF</span>
              </button>
              <a
                href="https://zalo.me/0924093461"
                target="_blank"
                rel="noreferrer"
                className="btn-gui-duoc-si px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
              >
                Gửi Dược Sĩ
              </a>
              <button
                type="button"
                onClick={open}
                className="btn-xem-chi-tiet px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                Xem Phác Đồ Chi Tiết →
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
