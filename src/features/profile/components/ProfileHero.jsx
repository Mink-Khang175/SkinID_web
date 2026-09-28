import { useEffect, useRef, useState } from 'react';

function joinDate(user) {
  try {
    const value = typeof user?.createdAt?.toDate === 'function' ? user.createdAt.toDate() : new Date(user?.createdAt);
    if (!Number.isNaN(value.getTime())) return value.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
  } catch {
    return 'SkinID';
  }
  return 'SkinID';
}

export default function ProfileHero({ user, historyCount, isLoading, onAvatarChange }) {
  const inputRef = useRef(null);
  const [imageFailed, setImageFailed] = useState(false);
  const name = user?.name || 'Thành viên SkinID';
  const showImage = user?.picture && !imageFailed;

  useEffect(() => setImageFailed(false), [user?.picture]);

  return (
    <div className="profile-hero rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-1/3 top-0 w-40 h-40 bg-white/60 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="profile-avatar-shell">
            {showImage
              ? <img src={user.picture} alt={`Ảnh đại diện của ${name}`} referrerPolicy="no-referrer" className="profile-avatar" onError={() => setImageFailed(true)} />
              : <div className="profile-avatar profile-avatar--fallback">{name.trim().charAt(0).toUpperCase() || 'U'}</div>}
            <input ref={inputRef} id="profile-avatar-input" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatarChange} />
            <button type="button" className="profile-avatar-edit" onClick={() => inputRef.current?.click()} aria-label="Thay đổi ảnh đại diện" title="Thay đổi ảnh đại diện">✎</button>
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5 min-h-[32px]">
              {isLoading ? <span className="inline-block animate-pulse bg-rose-100/70 rounded-lg h-7 w-36"></span> : <h1 className="text-xl sm:text-2xl font-black tracking-tight">{name}</h1>}
              {user && <span className="profile-provider-badge">{user.provider === 'google' ? 'Tài khoản Google' : 'Thành viên SkinID'}</span>}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 min-h-[20px]">{user?.email || ''}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-gray-500 font-medium">
              <span className="profile-meta-pill">Tham gia: <strong className="text-gray-800">{joinDate(user)}</strong></span>
              <span className="profile-meta-pill">Đã soi da: <strong className="text-brand-primary">{historyCount} lần</strong></span>
            </div>
          </div>
        </div>
        <a href="/skin-analysis" className="profile-btn profile-btn--primary w-full sm:w-auto justify-center">Soi Da AI Mới</a>
      </div>
    </div>
  );
}
