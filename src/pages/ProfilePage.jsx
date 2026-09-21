import { assetUrl } from '../assets/index.js';
import useLegacyApplication from '../hooks/useLegacyApplication.js';
import usePageMetadata from '../hooks/usePageMetadata.js';
import '../styles/profile.css';

export default function ProfilePage() {
  usePageMetadata({
    title: 'Hồ Sơ Cá Nhân & Lịch Sử Soi Da | SkinID.vn',
    description: 'Quản lý hồ sơ cá nhân và lịch sử soi da tại SkinID.vn.'
  });
  useLegacyApplication('profile');

  return (
    <div className="profile-page min-h-screen flex flex-col bg-gray-50/50">
{/* NAVBAR */}
    <header className="profile-header sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
                <img src={assetUrl('/images/logo.png')} alt="" className="h-10 w-10 object-contain transition-transform group-hover:scale-105" />
                <span className="text-xl font-black tracking-tight text-gray-900">SkinID<span className="text-brand-primary">.vn</span></span>
            </a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
                <a href="/" className="hover:text-brand-primary transition-colors flex items-center gap-1.5">
                    <i data-feather="home" className="w-4 h-4"></i> Trang chủ
                </a>
                <a href="/#catalog-section" className="hover:text-brand-primary transition-colors flex items-center gap-1.5">
                    <i data-feather="grid" className="w-4 h-4"></i> Sản phẩm
                </a>
                <a href="/#brand-story" className="hover:text-brand-primary transition-colors flex items-center gap-1.5">
                    <i data-feather="award" className="w-4 h-4"></i> Thương hiệu
                </a>
            </nav>

            <div className="flex items-center gap-3">
                <a href="/skin-analysis" className="profile-btn profile-btn--primary hidden sm:flex">
                    <i data-feather="camera" className="w-4 h-4"></i> Soi Da AI Ngay
                </a>
                <button 
                    type="button" 
                    onClick={() => window.handleProfileLogout?.()} 
                    className="px-3.5 py-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-gray-200 hover:border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer" 
                    title="Đăng xuất tài khoản"
                >
                    <i data-feather="log-out" className="w-4 h-4 text-rose-500"></i>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    </header>

    {/* MAIN CONTENT */}
    <main className="flex-grow container mx-auto px-4 lg:px-8 py-8 md:py-12 max-w-6xl">

        {/* USER PROFILE BANNER */}
        <div className="profile-hero rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute right-1/3 top-0 w-40 h-40 bg-white/60 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                {/* User Info Left */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                    <div className="profile-avatar-shell">
                    <div id="banner-avatar-container" className="relative">
                        {/* Injected via JS */}
                        <div className="profile-avatar profile-avatar--fallback bg-rose-100 text-brand-primary font-black">
                            <i data-feather="user" className="w-8 h-8 opacity-70"></i>
                        </div>
                    </div>
                    <input id="profile-avatar-input" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => window.handleProfileAvatarUpload?.(event)} />
                    <button type="button" className="profile-avatar-edit" onClick={() => document.getElementById('profile-avatar-input')?.click()} aria-label="Thay đổi ảnh đại diện" title="Thay đổi ảnh đại diện">
                        <i data-feather="camera" className="w-4 h-4"></i>
                    </button>
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5 min-h-[32px]">
                            <h1 id="banner-user-name" className="text-xl sm:text-2xl font-black tracking-tight">
                                <span className="inline-block animate-pulse bg-rose-100/70 rounded-lg h-7 w-36"></span>
                            </h1>
                            <span id="banner-provider-badge" className="profile-provider-badge hidden">
                                <i data-feather="check-circle" className="w-3 h-3"></i> Thành viên
                            </span>
                        </div>
                        <p id="banner-user-email" className="text-xs sm:text-sm text-gray-500 mb-3 min-h-[20px] flex items-center justify-center sm:justify-start">
                            <span className="inline-block animate-pulse bg-gray-200/70 rounded-md h-4 w-44"></span>
                        </p>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-gray-500 font-medium">
                            <span className="profile-meta-pill">
                                <i data-feather="calendar" className="w-3.5 h-3.5 text-brand-primary"></i> Tham gia: <strong id="banner-join-date" className="text-gray-800">SkinID</strong>
                            </span>
                            <span className="profile-meta-pill">
                                <i data-feather="activity" className="w-3.5 h-3.5 text-brand-primary"></i> Đã soi da: <strong id="banner-scan-count" className="text-brand-primary">--</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick CTA Right */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                    <a href="/skin-analysis" className="profile-btn profile-btn--primary w-full sm:w-auto justify-center">
                        <i data-feather="play" className="w-4 h-4"></i>
                        <span>Soi Da AI Mới</span>
                    </a>
                </div>
            </div>
        </div>

        {/* DASHBOARD NAVIGATION TABS */}
        <div className="profile-tabs flex overflow-x-auto no-scrollbar bg-white mb-8">
            <button onClick={() => window.switchProfileTab?.('profile')} id="tab-btn-profile" className="tab-btn active flex-1 min-w-[140px] py-4 px-4 text-xs sm:text-sm font-bold text-gray-600 transition-all flex items-center justify-center gap-2">
                <i data-feather="user" className="w-4 h-4"></i> Hồ Sơ Cá Nhân
            </button>
            <button onClick={() => window.switchProfileTab?.('history')} id="tab-btn-history" className="tab-btn flex-1 min-w-[140px] py-4 px-4 text-xs sm:text-sm font-bold text-gray-600 transition-all flex items-center justify-center gap-2">
                <i data-feather="clock" className="w-4 h-4"></i> Lịch Sử Soi Da & Phác Đồ
            </button>
            <button onClick={() => window.switchProfileTab?.('orders')} id="tab-btn-orders" className="tab-btn flex-1 min-w-[140px] py-4 px-4 text-xs sm:text-sm font-bold text-gray-600 transition-all flex items-center justify-center gap-2">
                <i data-feather="package" className="w-4 h-4"></i> Đơn Hàng
            </button>
            <button onClick={() => window.switchProfileTab?.('settings')} id="tab-btn-settings" className="tab-btn flex-1 min-w-[140px] py-4 px-4 text-xs sm:text-sm font-bold text-gray-600 transition-all flex items-center justify-center gap-2">
                <i data-feather="settings" className="w-4 h-4"></i> Cài Đặt & Bảo Mật
            </button>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: HỒ SƠ CÁ NHÂN & THỂ TRẠNG DA */}
        {/* =================================================================== */}
        <div id="tab-content-profile" className="tab-content block space-y-8">

            {/* 1.1 Thông tin cá nhân cơ bản */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Thông Tin Định Danh</h2>
                        <p className="text-xs text-gray-500">Cập nhật thông tin để SkinID cá nhân hóa kết quả tư vấn y khoa</p>
                    </div>
                </div>

                <form id="form-edit-profile" onSubmit={(event) => window.handleSaveProfile?.(event)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Họ và tên *</label>
                            <input type="text" id="prof-name" required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Địa chỉ Email</label>
                            <div className="profile-readonly-field">
                                <i data-feather="lock" className="w-4 h-4" aria-hidden="true"></i>
                                <input type="email" id="prof-email" readOnly aria-readonly="true" title="Email đăng nhập không thể thay đổi tại đây" />
                            </div>
                            <p className="profile-field-note">Đã xác thực · Không thể chỉnh sửa tại trang hồ sơ</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Số điện thoại liên hệ</label>
                            <input type="tel" id="prof-phone" placeholder="0901234567" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Ngày sinh</label>
                            <input type="date" id="prof-birthday" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Giới tính</label>
                            <select id="prof-gender" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all">
                                <option value="Nữ">Nữ</option>
                                <option value="Nam">Nam</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Địa chỉ nhận hàng mặc định</label>
                            <div className="profile-address-grid">
                                <select id="prof-province" aria-label="Tỉnh hoặc thành phố" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all">
                                    <option value="">Chọn tỉnh/thành</option>
                                </select>
                                <select id="prof-ward" aria-label="Phường hoặc xã" disabled className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all">
                                    <option value="">Chọn tỉnh/thành trước</option>
                                </select>
                                <input type="text" id="prof-address" placeholder="Số nhà, tên đường, tòa nhà…" autoComplete="street-address" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                            </div>
                            <p className="profile-field-note">Được đồng bộ hai chiều với địa chỉ tại bước thanh toán.</p>
                        </div>
                    </div>

                    {/* 1.2 Thể trạng làn da nền */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-black text-gray-900 mb-1">Hồ Sơ Thể Trạng Làn Da (Skin Baseline Profile)</h3>
                        <p className="text-xs text-gray-500 mb-4">Giúp AI đối chiếu giữa ảnh chụp và cảm nhận thực tế của bạn</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Loại da bạn tự nhận định:</label>
                                <select id="prof-skintype" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all">
                                    <option value="Chưa xác định">Chưa xác định (Chờ AI phân tích)</option>
                                    <option value="Da dầu">Da dầu (Tiết nhiều bã nhờn toàn mặt)</option>
                                    <option value="Da hỗn hợp thiên dầu">Da hỗn hợp thiên dầu (Đổ dầu vùng chữ T)</option>
                                    <option value="Da khô">Da khô / Thiếu ẩm</option>
                                    <option value="Da nhạy cảm">Da nhạy cảm / Dễ kích ứng</option>
                                    <option value="Da thường">Da thường / Khỏe mạnh</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Vấn đề da cần ưu tiên cải thiện nhất:</label>
                                <select id="prof-main-concern" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all">
                                    <option value="Mụn bọc & Mụn viêm">Mụn bọc & Mụn viêm</option>
                                    <option value="Thâm mụn & Sắc tố không đều">Thâm mụn & Sắc tố không đều</option>
                                    <option value="Lỗ chân lông to & Sợi bã nhờn">Lỗ chân lông to & Sợi bã nhờn</option>
                                    <option value="Lão hóa & Nếp nhăn">Lão hóa & Nếp nhăn</option>
                                    <option value="Khô ráp & Bong tróc">Khô ráp & Bong tróc</option>
                                    <option value="Mẩn đỏ & Giãn mao mạch">Mẩn đỏ & Giãn mao mạch</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div id="profile-save-bar" className="profile-save-bar hidden" aria-live="polite">
                        <p><strong>Bạn có thay đổi chưa lưu</strong><span>Kiểm tra lại thông tin trước khi cập nhật.</span></p>
                        <button id="profile-save-button" type="submit" className="profile-btn profile-btn--primary">
                            <i data-feather="save" className="w-4 h-4"></i> Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* =================================================================== */}
        {/* TAB 2: LỊCH SỬ SOI DA & TIẾN TRÌNH BIỂU ĐỒ */}
        {/* =================================================================== */}
        <div id="tab-content-history" className="tab-content hidden space-y-8">

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Tổng Lần Soi Da</span>
                    <h3 id="kpi-total-scans" className="text-2xl font-black text-gray-900">0</h3>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Điểm Cao Nhất</span>
                    <h3 id="kpi-max-score" className="text-2xl font-black text-brand-primary">0/100</h3>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Tuổi Da Gần Nhất</span>
                    <h3 id="kpi-latest-age" className="text-2xl font-black text-brand-primary">--</h3>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Tình Trạng Da</span>
                    <h3 id="kpi-latest-type" className="text-sm font-black text-gray-800 truncate">--</h3>
                </div>
            </div>

            {/* Health Progress Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Biểu Đồ Tiến Trình Sức Khỏe Làn Da</h2>
                        <p className="text-xs text-gray-500">Theo dõi sự thay đổi điểm số theo thời gian để đánh giá hiệu quả phác đồ</p>
                    </div>
                    <span className="text-xs font-bold text-brand-primary bg-brand-blush px-3 py-1 rounded-full border border-brand-petal">Kết quả tham khảo</span>
                </div>

                <div className="profile-chart-area h-64 sm:h-72 w-full">
                    <canvas id="progressChart" className="hidden"></canvas>
                    <div id="progress-chart-empty" className="profile-empty-state">
                        <div className="profile-empty-illustration" aria-hidden="true">
                            <span className="profile-empty-illustration__face"></span>
                            <span className="profile-empty-illustration__spark profile-empty-illustration__spark--one">✦</span>
                            <span className="profile-empty-illustration__spark profile-empty-illustration__spark--two">✦</span>
                        </div>
                        <strong>Hành trình làn da bắt đầu từ lần soi đầu tiên</strong>
                        <span>Thực hiện phân tích để theo dõi thay đổi qua từng lần chăm sóc.</span>
                        <a href="/skin-analysis" className="profile-btn profile-btn--primary"><i data-feather="camera" className="w-4 h-4"></i> Bắt đầu soi da</a>
                    </div>
                </div>
            </div>

            {/* Detailed Scan Timeline List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Nhật Ký Các Phiên Soi Da Chi Tiết</h2>
                        <p className="text-xs text-gray-500">Toàn bộ hồ sơ báo cáo và phác đồ y khoa đã được AI phân tích</p>
                    </div>
                    <a href="/" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                        + Soi da mới
                    </a>
                </div>

                <div id="timeline-scan-container" className="space-y-4">
                    {/* Injected via JS */}
                </div>
            </div>
        </div>

        <div id="tab-content-orders" className="tab-content hidden space-y-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="pb-4 mb-5 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Đơn Hàng Của Tôi</h2>
                    <p className="text-xs text-gray-500">Theo dõi trạng thái xác nhận, giao hàng và thanh toán của mọi đơn mua.</p>
                </div>
                <div id="profile-orders-container" className="space-y-4"></div>
            </div>
        </div>

        {/* =================================================================== */}
        {/* TAB 4: CÀI ĐẶT & BẢO MẬT & QUYỀN RIÊNG TƯ */}
        {/* =================================================================== */}
        <div id="tab-content-settings" className="tab-content hidden space-y-8">

            {/* 3.1 Đổi Mật Khẩu */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="pb-4 mb-6 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Bảo Mật & Mật Khẩu</h2>
                    <p className="text-xs text-gray-500">Thay đổi mật khẩu đăng nhập tài khoản Email cá nhân</p>
                </div>

                <form id="form-change-password" onSubmit={(event) => window.handleChangePassword?.(event)} className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
                        <input type="password" id="pass-current" required placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
                        <input type="password" id="pass-new" required placeholder="Tối thiểu 6 ký tự" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                        <input type="password" id="pass-confirm" required placeholder="Nhập lại mật khẩu mới" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                    </div>
                    <button type="submit" className="profile-btn profile-btn--secondary">
                        Cập nhật Mật Khẩu
                    </button>
                </form>
                <div id="google-password-notice" className="profile-google-notice hidden">
                    <i data-feather="shield" className="w-5 h-5"></i>
                    <div><strong>Mật khẩu do Google quản lý</strong><p>Tài khoản này đăng nhập qua Google nên không sử dụng mật khẩu riêng của SkinID.</p></div>
                </div>
            </div>

            {/* 3.2 Quyền Riêng Tư & Dữ Liệu Cá Nhân (NĐ 13/2023) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="pb-4 mb-6 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Quyền riêng tư & dữ liệu</h2>
                    <p className="text-xs text-gray-500">Bạn có thể tải bản sao dữ liệu hoặc xóa lịch sử soi da khỏi tài khoản.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="profile-data-card flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-gray-800 font-bold text-sm mb-1">
                                <i data-feather="download" className="w-4 h-4 text-brand-primary"></i> Xuất Tệp Dữ Liệu (Export JSON)
                            </div>
                            <p className="text-xs text-gray-500 mb-4">Tải về hồ sơ, lịch sử soi da, phác đồ và đơn hàng ở định dạng JSON.</p>
                        </div>
                        <button onClick={() => window.authManager?.exportUserDataJSON?.()} className="profile-btn profile-btn--secondary self-start">
                            Tải Xuống Dữ Liệu
                        </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1">
                                <i data-feather="trash-2" className="w-4 h-4 text-rose-600"></i> Xóa lịch sử soi da
                            </div>
                            <p className="text-xs text-rose-900/70 mb-4">Xóa vĩnh viễn các báo cáo soi da đã lưu. Hồ sơ, giỏ hàng và đơn mua vẫn được giữ nguyên.</p>
                        </div>
                        <button onClick={() => window.authManager?.clearAllUserHistory?.().then(() => window.renderProfileDashboard?.())} className="profile-btn profile-btn--danger self-start">
                            Xóa lịch sử soi da
                        </button>
                    </div>
                </div>
            </div>

            {/* 3.3 Quản lý phiên đăng nhập */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Phiên Đăng Nhập</h2>
                        <p className="text-xs text-gray-500">Đăng xuất tài khoản khỏi trình duyệt này để bảo mật thông tin cá nhân.</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => window.handleProfileLogout?.()} 
                        className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
                    >
                        <i data-feather="log-out" className="w-4 h-4"></i>
                        <span>Đăng xuất tài khoản</span>
                    </button>
                </div>
            </div>

        </div>

    </main>

    {/* SCAN DETAIL MODAL (Chi Tiết Phiên Soi Da) */}
    <div id="scan-detail-modal" className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] hidden opacity-0 transition-opacity duration-300 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" onClick={(e) => { if (e.target.id === 'scan-detail-modal') window.closeScanDetailModal?.(); }}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col border border-gray-100 my-auto animate-fade-in">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-blush text-brand-primary flex items-center justify-center font-bold">
                        <i data-feather="file-text" className="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 text-base sm:text-lg" id="modal-scan-title">Chi Tiết Phiên Soi Da</h3>
                        <p className="text-xs text-gray-400" id="modal-scan-date">Thời gian: --/--/----</p>
                    </div>
                </div>
                <button onClick={() => window.closeScanDetailModal?.()} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Đóng">
                    <i data-feather="x" className="w-5 h-5"></i>
                </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body p-6 pt-6 space-y-6 flex-grow">
                {/* Score & Skin Profile Card */}
                <div className="bg-gradient-to-br from-brand-blush/80 via-white to-brand-blush/30 border border-brand-petal shadow-sm rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0">
                        <div id="modal-score-glow" className="absolute inset-0 rounded-full transition-all duration-1000"></div>
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path id="modal-score-ring" className="transition-all duration-1000 ease-out" strokeDasharray="0, 100" strokeWidth="3" strokeLinecap="round" stroke="#10b981" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span id="modal-health-score" className="text-3xl font-black text-brand-dark">0</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Điểm Da</span>
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <h4 id="modal-skin-type" className="text-xl font-black text-gray-900">Da đang phân tích</h4>
                            <span id="modal-skin-age" className="px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">Tuổi da AI: --</span>
                        </div>
                        <div id="modal-overall-grade" className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            <span id="modal-grade-letter" className="font-black text-sm">B</span>
                            <span id="modal-grade-comment">Làn da ở mức ổn định</span>
                        </div>
                        <p id="modal-assessment-text" className="text-xs text-gray-600 leading-relaxed pt-1">
                            {/* Injected by JS */}
                        </p>
                    </div>
                </div>

                {/* Radar Chart (12 Chỉ Số Đa Tầng - Kế thừa từ kết quả Soi Da AI) */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-full md:w-1/2 relative h-[280px] flex items-center justify-center">
                            <canvas id="profileRadarChart" className="w-full h-full max-w-[320px] max-h-[280px] mx-auto"></canvas>
                        </div>
                        <div className="w-full md:w-1/2 space-y-3">
                            <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                <i data-feather="activity" className="w-4 h-4 text-brand-primary"></i>
                                Cấu Trúc Đa Tầng Của Làn Da
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Biểu đồ mạng nhện phân tích 12 thông số cấu trúc biểu bì, sắc tố và độ săn chắc. Vùng co thắt vào tâm cảnh báo các vấn đề tiềm ẩn cần tập trung can thiệp.
                            </p>
                            <div id="modal-radar-insights" className="space-y-2 pt-1">
                                {/* Injected by JS */}
                            </div>
                            <div id="modal-radar-tags" className="flex flex-wrap gap-1.5 pt-1">
                                {/* Injected by JS */}
                            </div>
                        </div>
                    </div>

                    {/* Chi tiết 12 chỉ số cấu trúc đa tầng */}
                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <h5 className="font-bold text-xs sm:text-sm text-gray-800 mb-3 flex items-center gap-1.5">
                            <i data-feather="bar-chart-2" className="w-4 h-4 text-brand-primary"></i>
                            Chi Tiết 12 Chỉ Số Cấu Trúc Đa Tầng
                        </h5>
                        <div id="modal-detailed-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            {/* Injected by JS */}
                        </div>
                    </div>
                </div>

                {/* Core 5 Metrics Breakdown Accordion */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                        <i data-feather="layers" className="w-4 h-4 text-brand-primary"></i>
                        Đánh Giá Chi Tiết 5 Chỉ Số Cốt Lõi
                    </h4>
                    <div id="modal-metrics-container" className="space-y-3">
                        {/* Injected by JS */}
                    </div>
                </div>

                {/* Recommended Skincare Routine */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                        <i data-feather="check-circle" className="w-4 h-4 text-brand-primary"></i>
                        Phác Đồ & Sản Phẩm Gợi Ý Cho Phiên Này
                    </h4>
                    <div id="modal-routine-products">
                        {/* Injected by JS */}
                    </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex items-center justify-between z-20">
                <a href="/skin-analysis" className="btn-soi-lai px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm">
                    <i data-feather="camera" className="w-3.5 h-3.5"></i>
                    <span>Soi Da Lại</span>
                </a>
                <button onClick={() => window.closeScanDetailModal?.()} className="px-5 py-2.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer">
                    Đóng
                </button>
            </div>
        </div>
    </div>

    {/* FOOTER */}
    <footer className="bg-white border-t border-brand-petal/40 py-8 text-center text-xs text-gray-400">
        <div className="container mx-auto px-4">
            <p>© 2026 SkinID.vn - Nền tảng hỗ trợ phân tích và chăm sóc da. Bản quyền thuộc về CÔNG TY TNHH FIELDMAN.</p>
        </div>
    </footer>

    {/* SCRIPTS */}
    </div>
  );
}
