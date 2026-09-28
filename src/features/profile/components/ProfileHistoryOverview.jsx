const chartWidth = 720;
const chartHeight = 270;
const padding = { top: 28, right: 24, bottom: 48, left: 44 };

function numeric(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function chartPoint(value, index, count) {
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const x = count <= 1 ? padding.left + plotWidth / 2 : padding.left + (index / (count - 1)) * plotWidth;
  const y = padding.top + (1 - Math.min(100, Math.max(0, value)) / 100) * plotHeight;
  return { x, y };
}

function shortDate(value) {
  return String(value || '').split(' ')[0] || '--/--';
}

function ProgressChart({ history }) {
  if (!history.length) {
    return (
      <div className="profile-empty-state">
        <div className="profile-empty-illustration" aria-hidden="true">
          <span className="profile-empty-illustration__face"></span>
          <span className="profile-empty-illustration__spark profile-empty-illustration__spark--one">✦</span>
          <span className="profile-empty-illustration__spark profile-empty-illustration__spark--two">✦</span>
        </div>
        <strong>Hành trình làn da bắt đầu từ lần soi đầu tiên</strong>
        <span>Thực hiện phân tích để theo dõi thay đổi qua từng lần chăm sóc.</span>
        <a href="/skin-analysis" className="profile-btn profile-btn--primary">Bắt đầu soi da</a>
      </div>
    );
  }

  const chronological = [...history].reverse();
  const scorePoints = chronological.map((scan, index) => chartPoint(numeric(scan.healthScore), index, chronological.length));
  const agePoints = chronological.map((scan, index) => chartPoint(numeric(scan.skinAge), index, chronological.length));
  const labelStep = Math.max(1, Math.ceil(chronological.length / 6));

  return (
    <div className="h-full w-full" role="img" aria-label="Biểu đồ điểm sức khỏe da và tuổi da AI theo thời gian">
      <div className="flex flex-wrap justify-center gap-4 text-[11px] font-bold mb-2" aria-hidden="true">
        <span className="flex items-center gap-1.5 text-brand-primary"><i className="w-5 h-0.5 bg-brand-primary rounded-full"></i>Điểm sức khỏe da</span>
        <span className="flex items-center gap-1.5 text-brand-dark"><i className="w-5 border-t-2 border-dashed border-brand-dark"></i>Tuổi da AI</span>
      </div>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[calc(100%-24px)] overflow-visible" aria-hidden="true">
        {[0, 25, 50, 75, 100].map((value) => {
          const { y } = chartPoint(value, 0, 1);
          return (
            <g key={value}>
              <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} stroke="#f1f2f4" strokeWidth="1" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-gray-400 text-[10px]">{value}</text>
            </g>
          );
        })}
        <polyline points={scorePoints.map(({ x, y }) => `${x},${y}`).join(' ')} fill="none" stroke="#E87A90" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={agePoints.map(({ x, y }) => `${x},${y}`).join(' ')} fill="none" stroke="#4A2E35" strokeWidth="2.5" strokeDasharray="7 6" strokeLinecap="round" strokeLinejoin="round" />
        {scorePoints.map((point, index) => (
          <g key={chronological[index].id || index}>
            <circle cx={point.x} cy={point.y} r="5" fill="#fff" stroke="#E87A90" strokeWidth="3" />
            {(index % labelStep === 0 || index === chronological.length - 1) && (
              <text x={point.x} y={chartHeight - 15} textAnchor="middle" className="fill-gray-500 text-[10px] font-semibold">
                Lần {index + 1} · {shortDate(chronological[index].dateFormatted)}
              </text>
            )}
          </g>
        ))}
        {agePoints.map((point, index) => <circle key={`age-${chronological[index].id || index}`} cx={point.x} cy={point.y} r="3.5" fill="#4A2E35" />)}
      </svg>
    </div>
  );
}

export default function ProfileHistoryOverview({ history = [] }) {
  const latest = history[0];
  const maxScore = history.reduce((maximum, scan) => Math.max(maximum, numeric(scan.healthScore)), 0);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Tổng Lần Soi Da</span>
          <h3 className="text-2xl font-black text-gray-900">{history.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Điểm Cao Nhất</span>
          <h3 className="text-2xl font-black text-brand-primary">{maxScore}/100</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Tuổi Da Gần Nhất</span>
          <h3 className="text-2xl font-black text-brand-primary">{latest?.skinAge ? `${latest.skinAge} tuổi` : '--'}</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Tình Trạng Da</span>
          <h3 className="text-sm font-black text-gray-800 truncate">{latest?.skinType || '--'}</h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">Biểu Đồ Tiến Trình Sức Khỏe Làn Da</h2>
            <p className="text-xs text-gray-500">Theo dõi sự thay đổi điểm số theo thời gian để đánh giá hiệu quả phác đồ</p>
          </div>
          <span className="text-xs font-bold text-brand-primary bg-brand-blush px-3 py-1 rounded-full border border-brand-petal">Kết quả tham khảo</span>
        </div>
        <div className="profile-chart-area h-64 sm:h-72 w-full">
          <ProgressChart history={history} />
        </div>
      </div>
    </>
  );
}
