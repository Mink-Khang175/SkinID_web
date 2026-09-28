export default function SkincareRoutine() {
  return (
    <>
<div className="legacy-modals-root">
{/* PRIVACY CONSENT MODAL */}
    <div id="privacy-modal" className="fixed inset-0 z-[60] bg-black/60 hidden flex-col items-center justify-center transition-opacity duration-300 opacity-0 px-4">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform scale-95 transition-transform duration-300" id="privacy-modal-content">
            <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Thỏa thuận Bảo mật & Quyền riêng tư</h3>
                <button onClick={(event) => window?.closePrivacyModal?.()} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <i data-feather="x" className="w-5 h-5"></i>
                </button>
            </div>
            <div className="p-6">
                <div className="bg-brand-petal/30 p-4 rounded-xl mb-6 border border-brand-petal/50">
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                        Để AI có thể phân tích chính xác tình trạng da, SkinID cần truy cập Camera trên thiết bị của bạn. Chúng tôi cam kết:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-3 mb-0">
                        <li className="flex items-start gap-3">
                            <div className="bg-brand-primary/10 p-1.5 rounded-full mt-0.5">
                                <i data-feather="shield" className="w-4 h-4 text-brand-primary flex-shrink-0"></i>
                            </div>
                            <span className="pt-1">Hình ảnh của bạn được phân tích theo thời gian thực và <strong>không lưu trữ</strong> trên bất kỳ máy chủ nào.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="bg-brand-primary/10 p-1.5 rounded-full mt-0.5">
                                <i data-feather="lock" className="w-4 h-4 text-brand-primary flex-shrink-0"></i>
                            </div>
                            <span className="pt-1">Dữ liệu khuôn mặt chỉ được sử dụng duy nhất cho mục đích cá nhân hóa phác đồ chăm sóc da.</span>
                        </li>
                    </ul>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                        <input type="checkbox" id="privacy-consent-checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-brand-primary/20 checked:border-brand-primary checked:bg-brand-primary transition-all cursor-pointer" onChange={(event) => window?.togglePrivacyButton?.()} />
                        <i data-feather="check" className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></i>
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors select-none font-medium">
                        Tôi đã đọc, hiểu và đồng ý với Chính sách bảo mật của SkinID.
                    </span>
                </label>
            </div>
            <div className="border-t border-gray-100 px-6 py-5 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
                <button onClick={(event) => window?.closePrivacyModal?.()} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 transition-colors">
                    Hủy bỏ
                </button>
                <button id="btn-privacy-continue" onClick={(event) => window?.requestCameraPermissionAndProceed?.()} className="scan-primary-button px-6 py-2.5 rounded-xl font-semibold text-white bg-gray-300 cursor-not-allowed transition-all flex items-center gap-2">
                    <i data-feather="camera" className="w-4 h-4"></i>
                    Cấp quyền Camera
                </button>
            </div>
        </div>
    </div>

    {/* AI SKIN SCAN MODAL (FULLSCREEN) */}
    <div id="ai-modal" className="fixed inset-0 z-50 bg-white hidden flex-col transition-opacity duration-300 opacity-0 overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-20 border-b border-gray-100 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <i data-feather="cpu" className="text-brand-primary w-5 h-5"></i>
                <h3 className="font-bold text-lg">Chuyên Gia AI Phân Tích Da</h3>
            </div>
            <button onClick={(event) => window?.closeScanModal?.()} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                <i data-feather="x" className="w-5 h-5"></i>
            </button>
        </div>

        <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full p-4 lg:p-8" id="modal-content-area">

            {/* FLOW: CAPTURE IMAGES */}
            <div id="capture-flow" className="flex-grow flex flex-col">

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8 max-w-md mx-auto w-full relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>

                    <div className="flex flex-col items-center gap-2" id="step-1-indicator">
                        <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-md transition-colors border-4 border-white">1</div>
                        <span className="text-xs font-semibold text-brand-primary">Chính diện</span>
                    </div>

                    <div className="flex flex-col items-center gap-2" id="step-2-indicator">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm transition-colors border-4 border-white">2</div>
                        <span className="text-xs font-medium text-gray-500">Trái 45°</span>
                    </div>

                    <div className="flex flex-col items-center gap-2" id="step-3-indicator">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm transition-colors border-4 border-white">3</div>
                        <span className="text-xs font-medium text-gray-500">Phải 45°</span>
                    </div>
                </div>

                {/* Setup Form (Skin Type & Budget) */}
                <div id="setup-form" className="bg-brand-soft-bg p-6 rounded-2xl mb-8 border border-brand-petal">
                    <h4 className="font-semibold text-lg mb-4">Thông tin cơ bản</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bạn cảm thấy da mình thuộc loại nào?</label>
                            <select id="user-skin-type" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                                <option value="Chưa rõ">Chưa rõ / Để AI đánh giá</option>
                                <option value="Da dầu">Da dầu (Thường xuyên đổ bóng nhờn)</option>
                                <option value="Da khô">Da khô (Cảm giác căng, thô ráp)</option>
                                <option value="Da hỗn hợp">Da hỗn hợp (Dầu vùng chữ T, khô vùng má)</option>
                                <option value="Da nhạy cảm">Da nhạy cảm (Dễ mẩn đỏ, kích ứng)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mức chi phí mong muốn cho quy trình</label>
                            <div className="flex gap-2">
                                <button type="button" className="budget-btn flex-1 py-2 px-2 border rounded-lg text-sm font-medium border-brand-primary bg-brand-blush text-brand-primary transition-colors" data-budget="Essential">Cơ bản</button>
                                <button type="button" className="budget-btn flex-1 py-2 px-2 border rounded-lg text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors" data-budget="Select">Tiêu chuẩn</button>
                                <button type="button" className="budget-btn flex-1 py-2 px-2 border rounded-lg text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors" data-budget="Signature">Nâng cao</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Camera Area */}
                <div className="relative w-full max-w-md mx-auto bg-black rounded-3xl overflow-hidden aspect-[3/4] shadow-2xl mb-6 flex-grow flex items-center justify-center">

                    <video id="webcam" className="w-full h-full object-cover transform scale-x-[-1]" autoPlay playsInline muted></video>

                    {/* Guide Overlay */}
                    {/* AI Status Indicator (Real-time) */}
                    <div className="absolute top-20 left-0 w-full flex flex-col items-center gap-2 z-30 px-4" id="ai-realtime-status">
                        <div id="ai-msg-angle" className="bg-red-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-opacity duration-300 opacity-0">Góc mặt chưa thẳng</div>
                        <div id="ai-msg-light" className="bg-orange-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-opacity duration-300 opacity-0">Ánh sáng không đều</div>
                        <div id="ai-msg-expr" className="bg-purple-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-opacity duration-300 opacity-0">Khuôn mặt chưa thả lỏng</div>
                        <div id="ai-msg-blur" className="bg-blue-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-opacity duration-300 opacity-0">Camera bị mờ/rung</div>
                        <div id="ai-msg-perfect" className="bg-green-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-opacity duration-300 opacity-0 flex items-center gap-2"><i data-feather="check-circle" className="w-4 h-4"></i> Giữ yên để chụp...</div>
                    </div>

                    <canvas id="ai-overlay" className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none transform scale-x-[-1]"></canvas>
                    {/* Instruction Text Overlay */}
                    <div className="absolute top-8 left-0 w-full text-center z-20 px-4">
                        <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full inline-block text-sm font-medium" id="instruction-text">
                            Chụp ảnh chính diện khuôn mặt
                        </div>
                    </div>

                    {/* Loading State */}
                    <div id="camera-loading" className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-30">
                        <i data-feather="loader" className="w-8 h-8 animate-spin mb-4 text-brand-primary"></i>
                        <p>Đang kết nối Camera...</p>
                    </div>

                </div>

                {/* Controls */}
                <div className="flex flex-col items-center justify-center gap-6">
                    <div className="scan-capture-actions">
                        <button id="capture-btn" onClick={(event) => window?.captureFrame?.()} className="w-16 h-16 rounded-full bg-white border-4 border-brand-primary shadow-[0_0_0_4px_rgba(255,255,255,1)] flex items-center justify-center active:scale-95 transition-transform" aria-label="Chụp ảnh">
                            <div className="w-12 h-12 rounded-full bg-brand-primary"></div>
                        </button>
                        <button type="button" onClick={(event) => window?.openScanFilePicker?.()} className="scan-upload-button"><i data-feather="upload" className="w-4 h-4"></i> Tải ảnh lên</button>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-4 h-20" id="thumbnails-container">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden" id="thumb-1"></div>
                        <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden" id="thumb-2"></div>
                        <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden" id="thumb-3"></div>
                    </div>

                    {/* Final Action */}
                    <div id="analyze-action" className="hidden w-full max-w-md mt-2">
                        <button id="start-analysis-btn" onClick={(event) => window?.startAnalysis?.()} className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg scan-primary-button">
                            <i data-feather="cpu" className="w-5 h-5"></i>
                            Bắt đầu phân tích AI
                        </button>
                    </div>
                </div>
            </div>

            {/* FLOW: ANALYZING LOADING STATE */}
            <div id="analyzing-flow" className="hidden flex-grow flex flex-col items-center justify-center py-10 px-4">
                {/* Scan Pulse Ring */}
                <div className="relative w-36 h-36 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-brand-petal/40"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" style={{ animationDuration: "1.2s" }}></div>
                    <div className="absolute inset-2 rounded-full border-2 border-purple-300/30 border-b-transparent animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div id="scan-icon-container" className="text-brand-primary transition-all duration-500">
                            <i data-feather="search" className="w-12 h-12 animate-pulse"></i>
                        </div>
                    </div>
                    {/* Glow pulse */}
                    <div className="absolute inset-0 rounded-full bg-brand-primary/10 animate-ping" style={{ animationDuration: "2s" }}></div>
                </div>

                {/* Step Title */}
                <h3 id="scan-step-title" className="text-xl font-bold mb-1 text-brand-dark text-center transition-all duration-300">🔍 Đang nhận diện khuôn mặt...</h3>
                <p id="scan-step-desc" className="text-gray-400 text-sm text-center max-w-xs mb-6 transition-all duration-300">Xác định vùng da từ 3 góc chụp</p>

                {/* Gradient Progress Bar */}
                <div className="w-full max-w-sm mb-6">
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div id="analysis-progress" className="h-full w-0 rounded-full transition-all duration-700 ease-out" style={{ background: "linear-gradient(90deg, #e87a90, #a855f7, #10b981)" }}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        <span>Nhận diện</span>
                        <span>Phân tích</span>
                        <span>Báo cáo</span>
                    </div>
                </div>

                {/* 5 Step Indicators */}
                <div className="w-full max-w-sm space-y-2.5 mb-6" id="scan-steps-list">
                    <div className="scan-step flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white/80 transition-all duration-500" data-step="1">
                        <div className="scan-step-icon w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 transition-all duration-500 flex-shrink-0">
                            <i data-feather="eye" className="w-3.5 h-3.5"></i>
                        </div>
                        <span className="scan-step-text text-sm font-medium text-gray-400 transition-all duration-500">Nhận diện khuôn mặt từ 3 góc độ</span>
                    </div>
                    <div className="scan-step flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white/80 transition-all duration-500" data-step="2">
                        <div className="scan-step-icon w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 transition-all duration-500 flex-shrink-0">
                            <i data-feather="layers" className="w-3.5 h-3.5"></i>
                        </div>
                        <span className="scan-step-text text-sm font-medium text-gray-400 transition-all duration-500">Phân tích cấu trúc biểu bì & hạ bì</span>
                    </div>
                    <div className="scan-step flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white/80 transition-all duration-500" data-step="3">
                        <div className="scan-step-icon w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 transition-all duration-500 flex-shrink-0">
                            <i data-feather="droplet" className="w-3.5 h-3.5"></i>
                        </div>
                        <span className="scan-step-text text-sm font-medium text-gray-400 transition-all duration-500">Đo lường độ ẩm, dầu & sắc tố melanin</span>
                    </div>
                    <div className="scan-step flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white/80 transition-all duration-500" data-step="4">
                        <div className="scan-step-icon w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 transition-all duration-500 flex-shrink-0">
                            <i data-feather="bar-chart-2" className="w-3.5 h-3.5"></i>
                        </div>
                        <span className="scan-step-text text-sm font-medium text-gray-400 transition-all duration-500">Tổng hợp 12 chỉ số cấu trúc da</span>
                    </div>
                    <div className="scan-step flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white/80 transition-all duration-500" data-step="5">
                        <div className="scan-step-icon w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 transition-all duration-500 flex-shrink-0">
                            <i data-feather="file-text" className="w-3.5 h-3.5"></i>
                        </div>
                        <span className="scan-step-text text-sm font-medium text-gray-400 transition-all duration-500">Tạo báo cáo cá nhân hóa</span>
                    </div>
                </div>

                {/* Thumbnail Scan Preview */}
                <div className="flex gap-3 items-center" id="scan-thumbnails">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-brand-petal/50 relative bg-gray-100" id="scan-thumb-1">
                        <div className="scan-line absolute inset-0 pointer-events-none"></div>
                    </div>
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-brand-petal/50 relative bg-gray-100" id="scan-thumb-2">
                        <div className="scan-line absolute inset-0 pointer-events-none"></div>
                    </div>
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-brand-petal/50 relative bg-gray-100" id="scan-thumb-3">
                        <div className="scan-line absolute inset-0 pointer-events-none"></div>
                    </div>
                </div>

                {/* Analysis Error Alert Card (Replaces intrusive alert popups) */}
                <div id="analysis-error-card" className="hidden w-full max-w-sm mt-6 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-center shadow-sm">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <i data-feather="alert-circle" className="w-5 h-5"></i>
                    </div>
                    <h4 className="text-sm font-bold text-rose-800 mb-1">Chưa thể hoàn tất phân tích</h4>
                    <p id="analysis-error-message" className="text-xs text-rose-600 mb-4 leading-relaxed">Kết nối mạng không ổn định hoặc dịch vụ đang bận. Vui lòng thử lại.</p>
                    <div className="flex gap-2 justify-center">
                        <button id="analysis-retry-btn" type="button" className="px-4 py-2 bg-gradient-to-r from-[#D96B82] to-[#C8526B] hover:from-[#C8526B] hover:to-[#B24058] text-white text-xs font-bold rounded-xl shadow-md shadow-rose-200/40 transition-all flex items-center gap-1.5 cursor-pointer">
                            <i data-feather="refresh-cw" className="w-3.5 h-3.5"></i> Thử lại
                        </button>
                        <button id="analysis-recapture-btn" type="button" className="px-4 py-2 bg-white text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer">
                            Chụp lại ảnh
                        </button>
                    </div>
                </div>

                {/* Hidden status for backward compat */}
                <p className="hidden" id="analysis-status"></p>
            </div>

            {/* FLOW: RESULTS REPORT */}
            <div id="results-flow" className="hidden flex-col gap-8 pb-10 w-full max-w-4xl mx-auto">
                {/* Khối 1: Skin ID Card */}
                {/* Confetti Canvas */}
                <canvas id="confetti-canvas" className="fixed inset-0 pointer-events-none z-[9999]" style={{ display: "none" }}></canvas>

                <div className="bg-gradient-to-br from-brand-blush to-white border border-brand-petal shadow-lg rounded-3xl overflow-hidden mt-4 relative">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative w-36 h-36 flex-shrink-0">
                            {/* Glow ring background */}
                            <div id="score-glow" className="absolute inset-0 rounded-full transition-all duration-1000" style={{ boxShadow: "0 0 0px transparent" }}></div>
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path id="health-score-ring" className="transition-all duration-1000 ease-out" strokeDasharray="0, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span id="health-score-text" className="text-4xl font-black text-brand-dark">0</span>
                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">Sức Khỏe</span>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left w-full">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold text-brand-dark" id="result-skin-type">Đang phân tích...</h2>
                                    <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-bold border border-brand-primary/20">Tuổi da: <span id="skin-age-text">--</span></div>
                                </div>
                            </div>
                            {/* Overall Grade Label */}
                            <div id="overall-grade-badge" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-3 border transition-all duration-500" style={{ display: "none" }}>
                                <span id="overall-grade-letter" className="text-lg font-black"></span>
                                <span id="overall-grade-text"></span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-500 mb-4 font-medium">
                                <span id="report-id" className="bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">ID: SKN-XYZ</span>
                                <span id="report-date" className="bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">Ngày: --/--/----</span>
                            </div>
                            <div id="result-tags" className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                                {/* Injected by JS */}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                <button type="button" onClick={() => document.getElementById('routine-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-5 py-2.5 bg-brand-dark hover:bg-black text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                    <i data-feather="arrow-down" className="w-4 h-4"></i> Xem phác đồ & sản phẩm
                                </button>
                                <button type="button" onClick={() => document.dispatchEvent(new CustomEvent('skinid:skin-report-email-request'))} className="px-5 py-2.5 bg-white border border-gray-300 hover:border-gray-900 text-gray-800 hover:text-black rounded-xl font-bold text-xs sm:text-sm shadow-2xs hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                    <i data-feather="mail" className="w-4 h-4"></i> Lưu về Email
                                </button>
                            </div>
                            <div className="mt-3 flex items-center justify-center md:justify-start gap-1 text-xs text-gray-500 font-medium">
                                <span>Đã tự động lưu vào hồ sơ cá nhân ·</span>
                                <a href="/profile?tab=history" className="text-brand-primary hover:underline font-semibold flex items-center gap-0.5">
                                    Xem lịch sử <i data-feather="external-link" className="w-3 h-3"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TẦNG 2: CHẨN ĐOÁN & CẢNH BÁO ƯU TIÊN */}
                <div className="space-y-4">
                    {/* Cảnh báo ưu tiên (Primary Concerns) */}
                    <div id="primary-concern-card" className="bg-rose-50/80 border border-rose-100 shadow-xs rounded-2xl p-5 md:p-6 flex items-start gap-4">
                        <div className="bg-rose-100 p-2.5 rounded-xl text-rose-500 mt-0.5 flex-shrink-0">
                            <i data-feather="alert-triangle" className="w-5 h-5"></i>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-rose-600 tracking-wider uppercase block mb-1">Cảnh báo ưu tiên can thiệp</span>
                            <h3 className="font-bold text-lg text-rose-900 mb-1" id="concern-title">⚠️ Đang tải cảnh báo...</h3>
                            <p className="text-rose-700/80 text-sm font-medium leading-relaxed" id="concern-desc">AI đang phân tích các vùng da có nguy cơ cao.</p>
                        </div>
                    </div>

                    {/* Đọc Hiểu Nhanh: Làn da bạn đang nói gì */}
                    <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-6">
                        <h3 className="font-bold text-base md:text-lg mb-2 flex items-center gap-2 text-brand-dark">
                            <i data-feather="message-circle" className="w-5 h-5 text-brand-primary"></i>
                            Đánh giá tổng quát từ AI
                        </h3>
                        <p id="result-assessment" className="text-gray-700 leading-relaxed text-sm md:text-[15px]">
                            {/* Injected by JS */}
                        </p>
                    </div>

                    {/* Tình trạng da phát hiện (Skin Conditions) */}
                    <div id="skin-conditions-card" className="bg-white border border-gray-100 shadow-xs rounded-2xl p-5 md:p-6" style={{ display: "none" }}>
                        <h3 className="font-bold text-base text-brand-dark mb-3 flex items-center gap-2">
                            <i data-feather="crosshair" className="w-4 h-4 text-brand-primary"></i>
                            Tình trạng da phát hiện
                        </h3>
                        <div id="skin-conditions-list" className="space-y-2.5">
                            {/* Injected by JS */}
                        </div>
                    </div>
                </div>

                {/* TẦNG 3: PHÁC ĐỒ CÁ NHÂN HÓA (SÁNG & TỐI) */}
                <div id="routine-section" className="scroll-mt-6">
                    <div className="mb-4 px-2">
                        <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block mb-1">Giải pháp điều trị</span>
                        <h3 className="font-bold text-xl md:text-2xl text-brand-dark flex items-center gap-2">
                            <i data-feather="sun" className="w-5 h-5 text-amber-500"></i>
                            Phác đồ 6 bước thiết kế riêng
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Buổi sáng */}
                        <div className="bg-[#FFFDF5] border border-[#FFE8A1] rounded-2xl p-5 shadow-xs">
                            <h4 className="font-bold text-[#B38C00] mb-4 flex items-center justify-between border-b border-[#FFE8A1] pb-3 text-sm uppercase tracking-wide">
                                <span>Buổi sáng · Bảo vệ & Cấp ẩm</span>
                                <i data-feather="sun" className="w-4 h-4"></i>
                            </h4>
                            <div className="space-y-3" id="routine-morning">
                                {/* Injected by JS */}
                            </div>
                        </div>
                        {/* Buổi tối */}
                        <div className="bg-[#F8FAFF] border border-[#D5E1FC] rounded-2xl p-5 shadow-xs">
                            <h4 className="font-bold text-[#3056D3] mb-4 flex items-center justify-between border-b border-[#D5E1FC] pb-3 text-sm uppercase tracking-wide">
                                <span>Buổi tối · Phục hồi & Tái tạo</span>
                                <i data-feather="moon" className="w-4 h-4"></i>
                            </h4>
                            <div className="space-y-3" id="routine-evening">
                                {/* Injected by JS */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TẦNG 4: BỘ SẢN PHẨM KHUYÊN DÙNG & CHECKOUT */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8">
                    <div className="mb-6">
                        <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block mb-1">Kê đơn phác đồ</span>
                        <h3 className="font-bold text-xl md:text-2xl text-brand-dark flex items-center gap-2">
                            <i data-feather="shopping-bag" className="text-brand-primary w-5 h-5"></i>
                            Routine Dược Mỹ Phẩm Khuyên Dùng
                        </h3>
                        <p className="text-gray-500 text-xs md:text-sm mt-1">Các sản phẩm chuẩn Y khoa Rilastil & TWON được AI đề xuất chính xác theo nhu cầu da của bạn.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="product-recommendations">
                        {/* Injected by JS */}
                    </div>

                    {/* HERO PRIMARY CTA: THÊM TRỌN BỘ */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-rose-50/80 via-brand-blush/40 to-white border border-brand-petal rounded-2xl text-center flex flex-col items-center">
                        <span className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Đạt hiệu quả tối ưu sau 28 ngày</span>
                        <button type="button" className="btn-hover-effect w-full sm:w-auto bg-gradient-to-r from-[#D96B82] to-[#C8526B] hover:from-[#C8526B] hover:to-[#B24058] text-white px-8 py-4 rounded-xl font-black text-sm sm:text-base inline-flex items-center justify-center gap-2.5 shadow-lg shadow-rose-200/50 hover:-translate-y-0.5 transition-all cursor-pointer" onClick={(event) => window?.addAllToCart?.()}>
                            <i data-feather="shopping-cart" className="w-5 h-5"></i>
                            Thêm trọn bộ phác đồ vào giỏ hàng
                        </button>
                        <p className="text-[11px] text-gray-500 mt-2 font-medium">Miễn phí giao hàng toàn quốc · Cam kết 100% dược mỹ phẩm chính hãng</p>
                    </div>
                </div>

                {/* TẦNG 5: PHÂN TÍCH CHUYÊN SÂU (COLLAPSIBLE ACCORDION) */}
                <details className="group bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden transition-all duration-300">
                    <summary className="p-6 flex items-center justify-between cursor-pointer list-none select-none hover:bg-gray-50/80 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                                <i data-feather="bar-chart-2" className="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-base md:text-lg text-brand-dark">Phân tích chuyên sâu 12 tầng cấu trúc & Môi trường</h3>
                                <p className="text-xs text-gray-500">Biểu đồ mạng nhện, chỉ số môi trường real-time và dự báo lão hóa 6 tháng.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-primary hidden sm:inline">Chi tiết</span>
                            <i data-feather="chevron-down" className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-300"></i>
                        </div>
                    </summary>

                    <div className="p-6 md:p-8 border-t border-gray-100 space-y-8 bg-gray-50/30">
                        {/* Phân tích môi trường */}
                        <div className="bg-blue-50/80 border border-blue-100 shadow-xs rounded-2xl p-5 flex items-start gap-4">
                            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-500 mt-1 flex-shrink-0">
                                <i data-feather="cloud-rain" className="w-5 h-5"></i>
                            </div>
                            <div className="w-full">
                                <h4 className="font-bold text-base text-blue-800 mb-2 flex items-center justify-between">
                                    <span>Tác động môi trường thời gian thực</span>
                                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">Real-time</span>
                                </h4>
                                <div className="grid grid-cols-3 gap-2 mb-2" id="environment-metrics">
                                    {/* JS Injected */}
                                </div>
                                <p className="text-blue-700/80 text-xs sm:text-sm font-medium" id="environment-impact">Đang phân tích tác động môi trường...</p>
                            </div>
                        </div>

                        {/* Biểu đồ mạng nhện 12 chỉ số */}
                        <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-6">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="w-full md:w-1/2 relative">
                                    <canvas id="radarChart" className="w-full max-w-[360px] mx-auto"></canvas>
                                </div>
                                <div className="w-full md:w-1/2">
                                    <h4 className="font-bold text-lg mb-2 text-brand-dark">Cân bằng cấu trúc 12 tầng</h4>
                                    <p className="text-gray-500 text-xs sm:text-sm mb-4 leading-relaxed">
                                        Biểu đồ thể hiện độ cân bằng sinh học của da. Vùng kéo căng ra ngoài viền cho thấy sức khỏe tốt, ngược lại vùng co thắt vào tâm cho thấy da đang bị tổn thương ngầm.
                                    </p>
                                    <div className="space-y-2.5" id="radar-insights">
                                        {/* Injected by JS */}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 border-t border-gray-100 pt-6 w-full">
                                <h5 className="font-bold text-sm text-brand-dark mb-3">Chi tiết từng chỉ số cấu trúc</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3" id="detailed-metrics-grid">
                                    {/* Injected by JS */}
                                </div>
                            </div>
                        </div>

                        {/* Giải mã nguyên nhân & Dự báo lão hóa */}
                        <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-6">
                            <h4 className="font-bold text-base md:text-lg text-brand-dark mb-3 flex items-center gap-2">
                                <i data-feather="search" className="text-brand-primary w-5 h-5"></i>
                                Giải mã nguyên nhân
                            </h4>
                            <div className="space-y-3 mb-6" id="root-cause-analysis">
                                {/* JS Injected */}
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 relative overflow-hidden shadow-md">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary rounded-full blur-3xl opacity-20"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <i data-feather="clock" className="text-brand-petal w-4 h-4"></i>
                                        <h5 className="text-base font-bold text-white">Dự báo làn da (6 tháng tới)</h5>
                                    </div>
                                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4" id="skin-forecast-text">
                                        Đang xử lý dự báo rủi ro cấu trúc...
                                    </p>
                                    <div className="bg-black/30 rounded-xl p-4 border border-white/10 backdrop-blur-xs">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-xs font-semibold text-emerald-400">Khả năng phục hồi với phác đồ chuẩn</span>
                                            <span className="text-lg font-black text-white">92%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                                            <div className="bg-emerald-500 h-1.5 rounded-full w-[92%] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 text-right">Lộ trình 28 - 45 ngày (Dược mỹ phẩm Rilastil & TWON)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </details>

                {/* TẦNG 6: ĐỒNG HÀNH CHU KỲ 28 NGÀY */}
                <div className="bg-gradient-to-br from-gray-900 to-brand-dark rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-brand-petal flex-shrink-0">
                            <i data-feather="calendar" className="w-6 h-6"></i>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-brand-petal uppercase tracking-wider block mb-0.5">Chu kỳ sinh học của làn da</span>
                            <h3 className="font-bold text-lg sm:text-xl mb-1.5">Đừng quên soi lại da sau 4 tuần!</h3>
                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                                Làn da cần từ 28 - 45 ngày để tái tạo tế bào mới. Hãy kiên trì tuân thủ phác đồ này và quét lại da sau 4 tuần để theo dõi sự cải thiện của các tầng cấu trúc.
                            </p>
                        </div>
                    </div>
                </div>

                {/* TẦNG 7: TƯ VẤN 1:1 QUA ZALO & MIỄN TRỪ Y KHOA */}
                <div className="flex flex-col items-center text-center space-y-4 pt-2 border-t border-gray-100">
                    <a href="https://zalo.me/0924093461" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#0068FF] hover:bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="24" fill="#0068FF"/>
                            <path d="M13.5 15.5h21v3.5l-12.5 11h12.5v3.5h-21v-3.5l12.5-11h-12.5v-3.5z" fill="#FFFFFF"/>
                        </svg>
                        Gặp Dược sĩ tư vấn phác đồ 1:1 qua Zalo
                    </a>
                    <p className="text-xs text-gray-400 max-w-2xl px-4 leading-relaxed">
                        * Kết quả phân tích được tạo bởi AI dựa trên thị giác máy tính và dữ liệu da liễu học chuẩn quốc tế, mang tính chất tư vấn và tham khảo.
                        Với các bệnh lý da liễu nghiêm trọng, hãy tham khảo thêm chỉ định từ bác sĩ chuyên khoa.
                    </p>
                </div>
            </div>

        </div>
    </div>



    {/* ========================================== */}
    {/* PRODUCT DETAIL MODAL (RILASTIL FORMULA & INGREDIENT SPEC) */}
    {/* ========================================== */}
    {/* LEGAL POLICIES MODAL (Bộ Công Thương & Nghị Định 13/2023/NĐ-CP) */}
    <div id="legal-modal" className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 hidden opacity-0 transition-opacity duration-300">
        <div id="legal-modal-content" className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl transform scale-95 transition-transform duration-300 relative border border-gray-100 max-h-[85vh] flex flex-col">
            <button onClick={(event) => window?.closeLegalModal?.()} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <i data-feather="x" className="w-5 h-5"></i>
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-brand-blush rounded-xl flex items-center justify-center text-brand-primary shadow-sm" id="legal-modal-icon">
                    <i data-feather="file-text" className="w-5 h-5"></i>
                </div>
                <div>
                    <h3 className="text-lg font-black text-brand-dark" id="legal-modal-title">Chính Sách Pháp Lý</h3>
                    <p className="text-xs text-gray-500 font-medium">Quy định áp dụng tại SkinID.vn (Công ty TNHH FieldMan)</p>
                </div>
            </div>

            {/* Scrollable Body */}
            <div id="legal-modal-body" className="overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed pr-2 flex-grow scrollbar-thin">
                {/* Injected via JS */}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button onClick={(event) => window?.closeLegalModal?.()} className="px-6 py-2 bg-brand-dark text-white rounded-xl text-xs font-bold shadow scan-primary-button">
                    Đã hiểu & Đóng
                </button>
            </div>
        </div>
    </div>
</div>
    </>
  );
}
