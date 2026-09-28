import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { assetUrl } from '../assets/index.js';
import {
  ProfileHero,
  ProfileHistoryOverview,
  ProfileHistoryTimeline,
  ProfileIdentityForm,
  ProfileOrders,
  ProfileScanDetailModal,
  useProfile
} from '../features/profile/index.js';
import usePageMetadata from '../hooks/usePageMetadata.js';
import '../styles/profile.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageMessage, setPageMessage] = useState(null);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirmation: '' });
  const [passwordMessage, setPasswordMessage] = useState(null);
  const {
    changeAvatar,
    cancelOrder,
    clearHistory,
    downloadData,
    downloadPdf,
    history,
    isAuthenticated,
    isLoading,
    isSaving,
    logout,
    orders,
    saveProfile,
    user,
    updatePassword
  } = useProfile();

  usePageMetadata({
    title: 'Hồ Sơ Cá Nhân & Lịch Sử Soi Da | SkinID.vn',
    description: 'Quản lý hồ sơ cá nhân và lịch sử soi da tại SkinID.vn.'
  });
  const validTabs = ['profile', 'history', 'orders', 'settings'];
  const requestedTab = searchParams.get('tab');
  const activeTab = validTabs.includes(requestedTab) ? requestedTab : 'profile';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/?auth=1', { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  const selectTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'profile') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      await changeAvatar(file);
      setPageMessage({ type: 'success', text: 'Ảnh đại diện đã được cập nhật.' });
    } catch (error) {
      setPageMessage({ type: 'error', text: error.message || 'Không thể cập nhật ảnh đại diện.' });
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordMessage(null);
    if (passwords.next !== passwords.confirmation) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp.' });
      return;
    }
    try {
      await updatePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirmation: '' });
      setPasswordMessage({ type: 'success', text: 'Mật khẩu đã được thay đổi thành công.' });
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Không thể đổi mật khẩu.' });
    }
  };

  const handleClearHistory = async () => {
    try {
      if (await clearHistory()) setPageMessage({ type: 'success', text: 'Lịch sử soi da đã được xóa.' });
    } catch (error) {
      setPageMessage({ type: 'error', text: error.message || 'Không thể xóa lịch sử soi da.' });
    }
  };

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
                    Trang chủ
                </a>
                <a href="/#catalog-section" className="hover:text-brand-primary transition-colors flex items-center gap-1.5">
                    Sản phẩm
                </a>
                <a href="/#brand-story" className="hover:text-brand-primary transition-colors flex items-center gap-1.5">
                    Thương hiệu
                </a>
            </nav>

            <div className="flex items-center gap-3">
                <a href="/skin-analysis" className="profile-btn profile-btn--primary hidden sm:flex">
                    Soi Da AI Ngay
                </a>
                <button 
                    type="button" 
                    onClick={handleLogout}
                    className="px-3.5 py-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-gray-200 hover:border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer" 
                    title="Đăng xuất tài khoản"
                >
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    </header>

    {/* MAIN CONTENT */}
    <main className="flex-grow container mx-auto px-4 lg:px-8 py-8 md:py-12 max-w-6xl">

        <ProfileHero user={user} historyCount={history.length} isLoading={isLoading} onAvatarChange={handleAvatarChange} />
        {pageMessage && <div role={pageMessage.type === 'error' ? 'alert' : 'status'} className={`mb-6 rounded-2xl px-4 py-3 text-xs font-semibold ${pageMessage.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{pageMessage.text}</div>}
        {/* DASHBOARD NAVIGATION TABS */}
        <div className="profile-tabs flex overflow-x-auto no-scrollbar bg-white mb-8">
            {[['profile', 'Hồ Sơ Cá Nhân'], ['history', 'Lịch Sử Soi Da & Phác Đồ'], ['orders', 'Đơn Hàng'], ['settings', 'Cài Đặt & Bảo Mật']].map(([tab, label]) => (
                <button key={tab} type="button" onClick={() => selectTab(tab)} aria-selected={activeTab === tab} className={`tab-btn ${activeTab === tab ? 'active' : ''} flex-1 min-w-[140px] py-4 px-4 text-xs sm:text-sm font-bold text-gray-600 transition-all flex items-center justify-center gap-2`}>{label}</button>
            ))}
        </div>

        {/* =================================================================== */}
        {/* TAB 1: HỒ SƠ CÁ NHÂN & THỂ TRẠNG DA */}
        {/* =================================================================== */}
        {activeTab === 'profile' && (
            <div className="space-y-8"><ProfileIdentityForm user={user} isSaving={isSaving} onSave={saveProfile} /></div>
        )}
        {/* =================================================================== */}
        {/* TAB 2: LỊCH SỬ SOI DA & TIẾN TRÌNH BIỂU ĐỒ */}
        {/* =================================================================== */}
        {activeTab === 'history' && <div className="space-y-8">

            <ProfileHistoryOverview history={history} />

            {/* Detailed Scan Timeline List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Nhật Ký Các Phiên Soi Da Chi Tiết</h2>
                        <p className="text-xs text-gray-500">Toàn bộ hồ sơ báo cáo và chu trình chăm sóc da đã được AI phân tích tham khảo</p>
                    </div>
                    <a href="/" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                        + Soi da mới
                    </a>
                </div>

                <ProfileHistoryTimeline history={history} />
            </div>
        </div>}

        {activeTab === 'orders' && <div className="space-y-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="pb-4 mb-5 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Đơn Hàng Của Tôi</h2>
                    <p className="text-xs text-gray-500">Theo dõi trạng thái xác nhận, giao hàng và thanh toán của mọi đơn mua.</p>
                </div>
                <ProfileOrders orders={orders} isLoading={isLoading} onCancel={cancelOrder} />
            </div>
        </div>}

        {/* =================================================================== */}
        {/* TAB 4: CÀI ĐẶT & BẢO MẬT & QUYỀN RIÊNG TƯ */}
        {/* =================================================================== */}
        {activeTab === 'settings' && <div className="space-y-8">

            {/* 3.1 Đổi Mật Khẩu */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="pb-4 mb-6 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Bảo Mật & Mật Khẩu</h2>
                    <p className="text-xs text-gray-500">Thay đổi mật khẩu đăng nhập tài khoản Email cá nhân</p>
                </div>

                {user?.provider !== 'google' ? <form id="form-change-password" onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
                        <input type="password" value={passwords.current} onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))} required placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
                        <input type="password" value={passwords.next} onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))} required minLength={6} placeholder="Tối thiểu 6 ký tự" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                        <input type="password" value={passwords.confirmation} onChange={(event) => setPasswords((current) => ({ ...current, confirmation: event.target.value }))} required minLength={6} placeholder="Nhập lại mật khẩu mới" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                    </div>
                    <button type="submit" disabled={isSaving} className="profile-btn profile-btn--secondary disabled:opacity-50">
                        {isSaving ? 'Đang cập nhật…' : 'Cập nhật Mật Khẩu'}
                    </button>
                    {passwordMessage && <div role={passwordMessage.type === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-xs font-semibold ${passwordMessage.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{passwordMessage.text}</div>}
                </form> : <div className="profile-google-notice">
                    <div><strong>Mật khẩu do Google quản lý</strong><p>Tài khoản này đăng nhập qua Google nên không sử dụng mật khẩu riêng của SkinID.</p></div>
                </div>}
            </div>

            {/* 3.2 Quyền Riêng Tư & Dữ Liệu Cá Nhân (NĐ 13/2023) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="pb-4 mb-6 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Quyền riêng tư & dữ liệu</h2>
                    <p className="text-xs text-gray-500">Bạn có thể tải bản sao dữ liệu hoặc xóa lịch sử soi da khỏi tài khoản.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="profile-data-card flex flex-col justify-between border-2 border-brand-primary/20 bg-gradient-to-br from-brand-blush/60 via-white to-brand-blush/20">
                        <div>
                            <div className="flex items-center gap-2 text-brand-dark font-black text-sm mb-1.5">
                                <svg className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                Xuất Báo Cáo PDF (Export PDF)
                            </div>
                            <p className="text-xs text-gray-600 mb-4 leading-relaxed">Tải về báo cáo hồ sơ cá nhân, 12 chỉ số cấu trúc da và chu trình chăm sóc gợi ý ở định dạng PDF rõ ràng, khoa học.</p>
                        </div>
                        <button type="button" onClick={downloadPdf} className="profile-btn profile-btn--primary self-start flex items-center gap-2 shadow-sm">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Tải Xuống Báo Cáo PDF
                        </button>
                    </div>

                    <div className="profile-data-card flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-gray-800 font-bold text-sm mb-1.5">
                                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="12" y1="18" x2="12" y2="12"></line>
                                    <line x1="9" y1="15" x2="15" y2="15"></line>
                                </svg>
                                Xuất Tệp Dữ Liệu (JSON)
                            </div>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">Tải về hồ sơ, lịch sử soi da, phác đồ và đơn hàng ở định dạng dữ liệu kỹ thuật JSON.</p>
                        </div>
                        <button type="button" onClick={downloadData} className="profile-btn profile-btn--secondary self-start">
                            Tải Xuống Dữ Liệu
                        </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1.5">
                                <svg className="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Xóa lịch sử soi da
                            </div>
                            <p className="text-xs text-rose-900/70 mb-4 leading-relaxed">Xóa vĩnh viễn các báo cáo soi da đã lưu. Hồ sơ, giỏ hàng và đơn mua vẫn được giữ nguyên.</p>
                        </div>
                        <button type="button" onClick={handleClearHistory} className="profile-btn profile-btn--danger self-start">
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
                        onClick={handleLogout}
                        className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
                    >
                        <span>Đăng xuất tài khoản</span>
                    </button>
                </div>
            </div>

        </div>}

    </main>

    <ProfileScanDetailModal history={history} />

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
