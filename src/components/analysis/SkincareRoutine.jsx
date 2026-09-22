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
                                <button onClick={(event) => window.emailService?.promptSendEmail?.()} className="px-5 py-2.5 bg-gradient-to-r from-[#D96B82] to-[#C8526B] hover:from-[#C8526B] hover:to-[#B24058] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-rose-200/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                    <i data-feather="mail" className="w-4 h-4"></i> Gửi báo cáo về Email
                                </button>
                                <button onClick={() => { window.location.href = '/profile?tab=history'; }} className="px-5 py-2.5 bg-white border border-gray-300 hover:border-gray-900 text-gray-800 hover:text-black rounded-xl font-bold text-xs sm:text-sm shadow-2xs hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 scan-primary-button">
                                    <i data-feather="clock" className="w-4 h-4"></i> Xem lịch sử cá nhân
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Khối 3: Đọc Hiểu Nhanh */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-brand-dark">
                        <i data-feather="message-circle" className="w-5 h-5 text-brand-primary"></i>
                        Làn da bạn đang nói gì?
                    </h3>
                    <p id="result-assessment" className="text-gray-700 leading-relaxed text-[15px]">
                        {/* Injected by JS */}
                    </p>
                </div>

                {/* Khối 2: Bảng 5 Chỉ Số */}

                {/* Phân tích môi trường */}
                <div className="bg-blue-50 border border-blue-100 shadow-sm rounded-2xl p-5 mb-6 flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-500 mt-1">
                        <i data-feather="cloud-rain" className="w-6 h-6"></i>
                    </div>
                    <div className="w-full">
                        <h3 className="font-bold text-lg text-blue-800 mb-2 flex items-center justify-between">
                            <span>Phân tích môi trường hiện tại</span>
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">Real-time</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-2 mb-3" id="environment-metrics">
                            {/* JS Injected */}
                        </div>
                        <p className="text-blue-700/80 text-sm font-medium" id="environment-impact">Đang phân tích tác động môi trường...</p>
                    </div>
                </div>

                {/* Khối 2: Cảnh báo ưu tiên (Primary Concerns) */}
                <div id="primary-concern-card" className="bg-rose-50 border border-rose-100 shadow-sm rounded-2xl p-5 md:p-6 flex items-start gap-4 mb-6">
                    <div className="bg-rose-100 p-3 rounded-full text-rose-500 mt-1">
                        <i data-feather="alert-triangle" className="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-rose-700 mb-1" id="concern-title">⚠️ Đang tải cảnh báo...</h3>
                        <p className="text-rose-600/80 text-sm font-medium" id="concern-desc">AI đang phân tích các vùng da có nguy cơ cao.</p>
                    </div>
                </div>

                {/* Khối 2.1: Tình trạng da phát hiện (Skin Conditions) */}
                <div id="skin-conditions-card" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 md:p-6 mb-6" style={{ display: "none" }}>
                    <h3 className="font-bold text-lg text-brand-dark mb-4 flex items-center gap-2">
                        <i data-feather="crosshair" className="w-5 h-5 text-brand-primary"></i>
                        Tình trạng da phát hiện
                    </h3>
                    <div id="skin-conditions-list" className="space-y-3">
                        {/* Injected by JS */}
                    </div>
                </div>

                {/* Khối 2.5: Biểu đồ mạng nhện 12 chỉ số */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/2 relative">
                            <canvas id="radarChart" className="w-full max-w-[400px] mx-auto"></canvas>
                        </div>
                        <div className="w-full md:w-1/2">
                            <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-brand-dark">
                                Phân tích cấu trúc 12 tầng
                            </h3>
                            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                                Biểu đồ mạng nhện thể hiện độ cân bằng của làn da. Những vùng kéo căng ra ngoài viền cho thấy sức khỏe tốt, ngược lại những vùng co thắt vào tâm (như Bã nhờn, Sắc tố UV) cho thấy da đang bị tổn thương ngầm.
                            </p>
                            <div className="space-y-3" id="radar-insights">
                                {/* Injected by JS */}
                            </div>
                        </div>
                    </div>
                            <div className="mt-8 border-t border-gray-100 pt-6 w-full">
                                <h4 className="font-bold text-lg text-brand-dark mb-4">Chi tiết 12 chỉ số cấu trúc</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4" id="detailed-metrics-grid">
                                    {/* Injected by JS */}
                                </div>
                            </div>



                </div>
                {/* Khối 3.5: Phân tích nguyên nhân & Dự báo lão hóa */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 mb-8 mt-6">
                    <h3 className="font-bold text-xl text-brand-dark mb-4 flex items-center gap-2">
                        <i data-feather="search" className="text-brand-primary w-6 h-6"></i>
                        Giải mã nguyên nhân & Dự báo
                    </h3>

                    <div className="space-y-4 mb-6" id="root-cause-analysis">
                        {/* JS Injected: Reason for Worst 1 and Worst 2 */}
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 relative overflow-hidden shadow-lg mt-6">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary rounded-full blur-3xl opacity-20"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <i data-feather="clock" className="text-brand-petal w-5 h-5"></i>
                                <h4 className="text-lg font-bold text-white">Dự báo làn da (6 tháng tới)</h4>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-4" id="skin-forecast-text">
                                Đang xử lý dự báo rủi ro cấu trúc...
                            </p>
                            <div className="bg-black/30 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-semibold text-emerald-400">Khả năng phục hồi nếu dùng phác đồ chuẩn</span>
                                    <span className="text-xl font-black text-white">92%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div className="bg-emerald-500 h-1.5 rounded-full w-[92%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 text-right">Lộ trình 28 - 45 ngày (Dược mỹ phẩm Rilastil)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Khối 4: Phác đồ Cá Nhân Hóa */}
                <div>
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-brand-dark px-2">
                        <i data-feather="sun" className="w-6 h-6 text-brand-primary"></i>
                        Phác đồ 6 bước thiết kế riêng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Buổi sáng */}
                        <div className="bg-[#FFFDF5] border border-[#FFE8A1] rounded-2xl p-5">
                            <h4 className="font-semibold text-[#B38C00] mb-4 flex items-center gap-2 border-b border-[#FFE8A1] pb-3">Buổi sáng</h4>
                            <div className="space-y-3" id="routine-morning">
                                {/* Injected by JS */}
                            </div>
                        </div>
                        {/* Buổi tối */}
                        <div className="bg-[#F8FAFF] border border-[#D5E1FC] rounded-2xl p-5">
                            <h4 className="font-semibold text-[#3056D3] mb-4 flex items-center gap-2 border-b border-[#D5E1FC] pb-3">Buổi tối</h4>
                            <div className="space-y-3" id="routine-evening">
                                {/* Injected by JS */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Khối 5: Sản Phẩm Gợi Ý */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 mb-4 gap-4">
            <h3 className="font-bold text-xl flex items-center gap-2 text-brand-dark">
                <i data-feather="shopping-bag" className="text-brand-primary w-5 h-5"></i>
                Routine Khuyên Dùng
            </h3>
            <button className="bg-brand-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 scan-primary-button">
                Xem chi tiết liệu trình <i data-feather="arrow-right" className="w-4 h-4"></i>
            </button>
        </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="product-recommendations">
                        {/* Injected by JS */}
                    </div>
                    <div className="mt-6 text-center">
                        <button className="btn-hover-effect w-full md:w-auto bg-gradient-to-r from-[#D96B82] to-[#C8526B] hover:from-[#C8526B] hover:to-[#B24058] text-white px-8 py-3.5 rounded-xl font-bold text-base inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-rose-200/50 hover:-translate-y-0.5 transition-all cursor-pointer" onClick={(event) => window?.addAllToCart?.()}>
                            <i data-feather="shopping-cart" className="w-5 h-5"></i>
                            Thêm sản phẩm đã chọn vào giỏ
                        </button>
                    </div>
                </div>

                {/* Khối 6: Theo Dõi Tiến Trình */}
                <div className="bg-gradient-to-r from-gray-900 to-brand-dark rounded-2xl p-6 text-white text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Đừng quên theo dõi sự thay đổi!</h3>
                        <p className="text-gray-300 text-sm">Quét lại da sau 4 tuần để thấy rõ sự cải thiện từ phác đồ này.</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                        <input type="email" placeholder="Nhập email của bạn..." className="px-4 py-2.5 rounded-xl text-gray-900 w-full sm:w-64 outline-none focus:ring-2 focus:ring-brand-primary" />
                        <button className="px-5 py-2.5 bg-gradient-to-r from-[#D96B82] to-[#C8526B] hover:from-[#C8526B] hover:to-[#B24058] text-white rounded-xl font-bold transition-all flex-shrink-0 cursor-pointer shadow-xs">
                            Nhắc tôi
                        </button>
                    </div>
                </div>

                {/* Khối 7: Disclaimer & Zalo */}
                <div className="flex flex-col items-center text-center space-y-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 max-w-2xl px-4">
                        * Kết quả phân tích được tạo bởi AI (Trí tuệ nhân tạo) dựa trên công nghệ thị giác máy tính và chỉ mang tính chất tham khảo.
                        Để có phác đồ điều trị y khoa chính xác nhất cho các bệnh lý về da, vui lòng liên hệ chuyên gia.
                    </p>
                    <a href="https://zalo.me/0924093461" target="_blank" className="px-6 py-2.5 bg-[#0068FF] text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="24" fill="#0068FF"/>
                            <path d="M13.5 15.5h21v3.5l-12.5 11h12.5v3.5h-21v-3.5l12.5-11h-12.5v-3.5z" fill="#FFFFFF"/>
                        </svg>
                        Gặp Dược sĩ tư vấn 1:1 qua Zalo
                    </a>
                </div>
            </div>

        </div>
    </div>



    {/* ========================================== */}
    {/* PRODUCT DETAIL MODAL (RILASTIL FORMULA & INGREDIENT SPEC) */}
    {/* ========================================== */}
    {/* AUTH MODAL — MODERN E-COMMERCE STANDARD */}
    <div id="auth-modal" className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 hidden opacity-0 transition-all duration-300" style={{background:'rgba(45, 31, 35, 0.65)', backdropFilter:'blur(12px)'}}>
        <div id="auth-modal-content" className="auth-shell auth-mode-login transform scale-95 transition-all duration-300">

            {/* ══ PANEL: ĐĂNG NHẬP ══ */}
            <div className="auth-panel auth-panel--login" id="auth-panel-login">
                {/* Close button */}
                <button onClick={(event) => window.authManager?.closeAuthModal?.()} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-rose-50 transition-colors z-10" aria-label="Đóng">
                    <i data-feather="x" className="w-4 h-4"></i>
                </button>

                <div className="auth-panel__inner">
                    {/* Clean Header */}
                    <div className="text-center mb-5">
                        <h3 className="auth-title-clean" id="auth-login-heading">Đăng nhập</h3>
                        <p className="auth-subtitle-clean">Chào mừng bạn trở lại với SkinID</p>
                    </div>

                    {/* Inline notice (chỉ hiện khi có lời nhắc thân thiện) */}
                    <div id="auth-modal-notice" className="auth-inline-notice hidden">
                        <i data-feather="sparkles" className="w-3.5 h-3.5 flex-shrink-0 text-[#e45f7a]"></i>
                        <span id="auth-notice-text"></span>
                    </div>

                    {/* Google Sign-in — Ưu tiên 1-click */}
                    <button onClick={(event) => window.authManager?.triggerGoogleSignIn?.()} className="auth-google-btn group">
                        <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        <span>Tiếp tục với Google</span>
                    </button>

                    <div className="auth-divider"><span>hoặc với email</span></div>

                    {/* Form đăng nhập sạch (KHÔNG ICON) */}
                    <form id="form-login" onSubmit={(event) => window?.handleLoginSubmit?.(event)} className="space-y-3">
                        <div>
                            <label className="auth-field-label" htmlFor="login-email">Email</label>
                            <input type="email" id="login-email" required placeholder="nhapemail@gmail.com" className="auth-field-input" autoComplete="email" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="auth-field-label mb-0" htmlFor="login-password">Mật khẩu</label>
                                <button type="button" onClick={(event) => window?.toggleAuthForgot?.()} className="auth-forgot-link">Quên mật khẩu?</button>
                            </div>
                            <div className="relative">
                                <input type="password" id="login-password" required placeholder="••••••••" className="auth-field-input pr-14" autoComplete="current-password" />
                                <button type="button" onClick={(event) => window?.togglePasswordVisibility?.('login-password', event.currentTarget)} className="auth-pwd-toggle">HIỆN</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-0.5">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" id="login-remember" defaultChecked className="w-4 h-4 rounded accent-[#e45f7a]" />
                                <span className="text-xs text-[#6F686B] font-medium">Ghi nhớ đăng nhập</span>
                            </label>
                        </div>
                        <button type="submit" className="auth-cta-btn">
                            Đăng nhập
                        </button>
                    </form>

                    {/* Form quên mật khẩu */}
                    <form id="form-forgot" onSubmit={(event) => window?.handleForgotSubmit?.(event)} className="space-y-3 hidden">
                        <p className="text-xs text-[#6F686B] leading-relaxed">Nhập email đăng ký của bạn. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu an toàn.</p>
                        <div>
                            <label className="auth-field-label" htmlFor="forgot-email">Email tài khoản</label>
                            <input type="email" id="forgot-email" required placeholder="nhapemail@gmail.com" className="auth-field-input" />
                        </div>
                        <button type="submit" className="auth-cta-btn">
                            Gửi yêu cầu khôi phục
                        </button>
                        <button type="button" onClick={(event) => window?.toggleAuthForgot?.(true)} className="w-full text-center text-xs text-[#7A6E71] hover:text-[#282326] py-1 font-semibold transition-colors">← Quay lại đăng nhập</button>
                    </form>

                    {/* Mobile switch to Register */}
                    <div className="auth-mobile-switch md:hidden text-center mt-4 pt-3 border-t border-rose-100">
                        <span className="text-xs text-[#6F686B]">Chưa có tài khoản? </span>
                        <button type="button" onClick={(event) => window?.toggleAuthSlider?.('register')} className="text-xs font-bold text-[#e45f7a] hover:underline">Tạo tài khoản ngay</button>
                    </div>
                </div>
            </div>

            {/* ══ PANEL: ĐĂNG KÝ ══ */}
            <div className="auth-panel auth-panel--register" id="auth-panel-register">
                {/* Close button */}
                <button onClick={(event) => window.authManager?.closeAuthModal?.()} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-rose-50 transition-colors z-10" aria-label="Đóng">
                    <i data-feather="x" className="w-4 h-4"></i>
                </button>

                <div className="auth-panel__inner">
                    <div className="text-center mb-4">
                        <h3 className="auth-title-clean">Tạo tài khoản</h3>
                        <p className="auth-subtitle-clean">Đăng ký nhanh chóng chỉ trong 1 phút</p>
                    </div>

                    <form id="form-register" onSubmit={(event) => window?.handleRegisterSubmit?.(event)} className="mt-2">
                        {/* Hàng 1: Họ tên + SĐT (2 cột) */}
                        <div className="auth-grid-2">
                            <div>
                                <label className="auth-field-label" htmlFor="reg-name">Họ và tên *</label>
                                <input type="text" id="reg-name" required placeholder="Nguyễn Văn A" className="auth-field-input" autoComplete="name" />
                            </div>
                            <div>
                                <label className="auth-field-label" htmlFor="reg-phone">Số điện thoại</label>
                                <input type="tel" id="reg-phone" placeholder="0901234567" className="auth-field-input" autoComplete="tel" />
                            </div>
                        </div>
                        {/* Hàng 2: Email */}
                        <div className="mt-2">
                            <label className="auth-field-label" htmlFor="reg-email">Email *</label>
                            <input type="email" id="reg-email" required placeholder="email@gmail.com" className="auth-field-input" autoComplete="email" />
                        </div>
                        {/* Hàng 3: Mật khẩu + Xác nhận (2 cột) */}
                        <div className="auth-grid-2 mt-2">
                            <div>
                                <label className="auth-field-label" htmlFor="reg-password">Mật khẩu *</label>
                                <div className="relative">
                                    <input type="password" id="reg-password" required onInput={(event) => window?.handlePasswordStrengthInput?.(event.currentTarget.value)} placeholder="Tối thiểu 6 ký tự" className="auth-field-input pr-12" autoComplete="new-password" />
                                    <button type="button" onClick={(event) => window?.togglePasswordVisibility?.('reg-password', event.currentTarget)} className="auth-pwd-toggle">HIỆN</button>
                                </div>
                            </div>
                            <div>
                                <label className="auth-field-label" htmlFor="reg-confirm-password">Xác nhận *</label>
                                <div className="relative">
                                    <input type="password" id="reg-confirm-password" required onInput={(event) => window?.handleConfirmPasswordInput?.()} placeholder="Nhập lại mật khẩu" className="auth-field-input pr-12" autoComplete="new-password" />
                                    <button type="button" onClick={(event) => window?.togglePasswordVisibility?.('reg-confirm-password', event.currentTarget)} className="auth-pwd-toggle">HIỆN</button>
                                </div>
                                <p id="reg-confirm-msg" className="text-[9px] font-bold mt-1 hidden"></p>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="mt-2">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                                <input type="checkbox" id="reg-terms" required defaultChecked className="w-3.5 h-3.5 mt-0.5 rounded accent-[#e45f7a] flex-shrink-0" />
                                <span className="text-[11px] text-[#6F686B] leading-tight">Tôi đồng ý với <a href="#" className="text-[#e45f7a] font-semibold hover:underline">Điều khoản</a> &amp; <a href="#" className="text-[#e45f7a] font-semibold hover:underline">Bảo mật</a> SkinID.</span>
                            </label>
                        </div>
                        <button type="submit" className="auth-cta-btn mt-2.5">
                            Tạo tài khoản &amp; Bắt đầu
                        </button>
                    </form>

                    {/* Google option */}
                    <div className="auth-divider mt-2"><span>hoặc</span></div>
                    <button onClick={(event) => window.authManager?.triggerGoogleSignIn?.()} className="auth-google-btn auth-google-btn--compact group">
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        <span>Đăng ký nhanh bằng Google</span>
                    </button>

                    {/* Mobile switch to Login */}
                    <div className="auth-mobile-switch md:hidden text-center mt-3 pt-2 border-t border-rose-100">
                        <span className="text-xs text-[#6F686B]">Đã có tài khoản? </span>
                        <button type="button" onClick={(event) => window?.toggleAuthSlider?.('login')} className="text-xs font-bold text-[#e45f7a] hover:underline">Đăng nhập ngay</button>
                    </div>
                </div>
            </div>

            {/* ══ OVERLAY PANEL (Visual thuần cảm xúc, không chữ rườm rà) ══ */}
            <div className="auth-overlay-panel" aria-hidden="true">
                <video className="auth-overlay-panel__video" autoPlay muted loop playsInline preload="metadata">
                    <source src="/videos/auth_video.mp4" type="video/mp4" />
                </video>
                {/* Lớp phủ Gradient Hồng Đào trong trẻo */}
                <div className="auth-overlay-panel__gradient"></div>

                {/* Nội dung khi Overlay đang ở TRÁI (Login mode) */}
                <div className="auth-overlay-content auth-overlay-content--login">
                    <h2 className="auth-overlay__headline-clean">Trọn hành trình làn da cùng SkinID.</h2>
                    <div className="auth-overlay__cta-clean">
                        <p className="text-xs text-white/90 mb-2.5">Chưa có tài khoản?</p>
                        <button type="button" className="auth-ghost-btn" onClick={(event) => window.toggleAuthSlider?.('register')}>
                            Tạo tài khoản ngay →
                        </button>
                    </div>
                </div>

                {/* Nội dung khi Overlay đang ở PHẢI (Register mode) */}
                <div className="auth-overlay-content auth-overlay-content--register">
                    <h2 className="auth-overlay__headline-clean">Chào mừng bạn trở lại với SkinID.</h2>
                    <div className="auth-overlay__cta-clean">
                        <p className="text-xs text-white/90 mb-2.5">Đã có tài khoản?</p>
                        <button type="button" className="auth-ghost-btn" onClick={(event) => window.toggleAuthSlider?.('login')}>
                            ← Đăng nhập ngay
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </div>



    {/* HISTORY MODAL (View Past Scans) */}
    <div id="history-modal" className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 hidden opacity-0 transition-opacity duration-300">
        <div id="history-modal-content" className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl transform scale-95 transition-transform duration-300 relative border border-gray-100 max-h-[85vh] flex flex-col">
            <button onClick={(event) => window.authManager?.closeHistoryModal?.()} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <i data-feather="x" className="w-5 h-5"></i>
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-brand-blush rounded-xl flex items-center justify-center text-brand-primary shadow-sm">
                    <i data-feather="activity" className="w-5 h-5"></i>
                </div>
                <div>
                    <h3 className="text-lg font-black text-brand-dark">Lịch Sử Phân Tích Da Cá Nhân</h3>
                    <p className="text-xs text-gray-500 font-medium">Theo dõi tiến trình và sự cải thiện của làn da qua từng lần quét</p>
                </div>
            </div>

            {/* List Container */}
            <div id="history-list-container" className="overflow-y-auto space-y-3 pr-1 flex-grow scrollbar-thin">
                {/* Injected by auth.js */}
            </div>
        </div>
    </div>

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
