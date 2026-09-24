import { useEffect, useRef, useState } from 'react';

const CONCERNS = [
  {
    id: 'tri-mun-kiem-dau',
    title: 'Kiểm soát dầu & Mụn',
    desc: 'Giảm bóng nhờn, ngăn ngừa bít tắc lỗ chân lông',
    tags: ['Salicylic Acid', 'Tràm trà'],
    iconBg: '#fff1f4',
    iconColor: '#E06D81',
    floatClass: 'float-y-1',
  },
  {
    id: 'cap-am-chuyen-sau',
    title: 'Cấp ẩm & Căng mọng',
    desc: 'Cấp nước tầng sâu, duy trì độ ẩm mịn suốt 72h',
    tags: ['Hyaluronic Acid', 'Ceramide'],
    iconBg: '#f0f9ff',
    iconColor: '#0284c7',
    floatClass: 'float-y-2',
  },
  {
    id: 'phuc-hoi-diu-da',
    title: 'Phục hồi & Làm dịu',
    desc: 'Dịu mẩn đỏ, củng cố hàng rào bảo vệ tự nhiên',
    tags: ['Vitamin B5', 'Rau má'],
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    floatClass: 'float-y-3',
  },
  {
    id: 'sang-da-mo-tham',
    title: 'Dưỡng sáng & Mờ thâm',
    desc: 'Mờ thâm mụn, đều màu & rạng rỡ tự nhiên',
    tags: ['Niacinamide', 'Vitamin C'],
    iconBg: '#fffbeb',
    iconColor: '#d97706',
    floatClass: 'float-y-4',
  },
];

export default function HelpSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleSelectBenefit = (e, benefitId) => {
    if (window.location.pathname === '/products') {
      e.preventDefault();
      window.applyCatalogState?.({ benefit: benefitId });
    }
  };

  const renderIcon = (id) => {
    switch (id) {
      case 'tri-mun-kiem-dau':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 8v4"></path>
            <circle cx="12" cy="16" r="0.75" fill="currentColor"></circle>
          </svg>
        );
      case 'cap-am-chuyen-sau':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
        );
      case 'phuc-hoi-diu-da':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
        );
      case 'sang-da-mo-tham':
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="12" y1="2" x2="12" y2="4"></line>
            <line x1="12" y1="20" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
            <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="4" y2="12"></line>
            <line x1="20" y1="12" x2="22" y2="12"></line>
          </svg>
        );
    }
  };

  return (
    <section
      id="skin-advisor"
      ref={sectionRef}
      className={`section borderless-advisor-section ${isVisible ? 'is-visible' : ''}`}
      aria-labelledby="need-advisor-title"
    >
      <div className="container gentle-advisor-grid">
        {/* ===============================================================
            CỘT TRÁI (40%): Nội dung tĩnh & Duy nhất 1 CTA Pill
            =============================================================== */}
        <div className="advisor-static-col">
          <span className="advisor-tagline adv-anim-item adv-anim-tagline">TƯ VẤN CHUYÊN BIỆT · SKIN CARE CONCERNS</span>
          
          <h2 id="need-advisor-title" className="advisor-heading adv-anim-item adv-anim-heading">
            Chăm sóc đúng điều <span className="highlight-pink">làn da đang cần</span>
          </h2>
          
          <p className="advisor-description adv-anim-item adv-anim-desc">
            Không còn băn khoăn giữa hàng trăm bước chăm sóc. Lắng nghe làn da để tìm thấy routine lý tưởng, tối ưu theo từng mục tiêu thực tế của bạn.
          </p>

          <div className="advisor-cta-wrap adv-anim-item adv-anim-cta">
            <button
              className="advisor-pill-cta"
              type="button"
              onClick={() => window.openConsultation?.()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Tư vấn chọn theo nhu cầu</span>
            </button>
          </div>
        </div>

        {/* ===============================================================
            CỘT PHẢI (60%): Cụm Floating Cluster (4 Nhu cầu da so le)
            - Không có container bọc màu cứng hay border
            - 4 thẻ bo góc 32px, shadow xám siêu nhạt nổi khối 3D
            - Mặc định: Thu gọn (Icon + Tiêu đề)
            - Hover: Height transition mở rộng mô tả + tag thành phần
            - Animation: Floating Y chậm liên tục 4s
            =============================================================== */}
        <div className="advisor-floating-col adv-anim-item adv-anim-cluster">
          <div className="floating-cluster-canvas">
            {/* Cột 1 (So le Y: 0px & 36px) */}
            <div className="floating-cluster-lane lane-left">
              {[CONCERNS[0], CONCERNS[2]].map((item) => (
                <a
                  key={item.id}
                  href={`/products?benefit=${item.id}`}
                  onClick={(e) => handleSelectBenefit(e, item.id)}
                  className={`floating-concern-card ${item.floatClass}`}
                >
                  <div className="floating-card-header">
                    <div
                      className="floating-card-icon"
                      style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                    >
                      {renderIcon(item.id)}
                    </div>
                    <div className="floating-card-title-wrap">
                      <span className="floating-card-title">{item.title}</span>
                    </div>
                    <span className="floating-card-arrow" aria-hidden="true">→</span>
                  </div>

                  {/* Vùng mở rộng mượt mà (Height transition qua grid-template-rows) */}
                  <div className="floating-card-expand">
                    <div className="floating-card-expand-inner">
                      <p className="floating-card-desc">{item.desc}</p>
                      <div className="floating-card-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="floating-pill-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Cột 2 (So le Y: 48px & 36px) */}
            <div className="floating-cluster-lane lane-right">
              {[CONCERNS[1], CONCERNS[3]].map((item) => (
                <a
                  key={item.id}
                  href={`/products?benefit=${item.id}`}
                  onClick={(e) => handleSelectBenefit(e, item.id)}
                  className={`floating-concern-card ${item.floatClass}`}
                >
                  <div className="floating-card-header">
                    <div
                      className="floating-card-icon"
                      style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                    >
                      {renderIcon(item.id)}
                    </div>
                    <div className="floating-card-title-wrap">
                      <span className="floating-card-title">{item.title}</span>
                    </div>
                    <span className="floating-card-arrow" aria-hidden="true">→</span>
                  </div>

                  {/* Vùng mở rộng mượt mà (Height transition qua grid-template-rows) */}
                  <div className="floating-card-expand">
                    <div className="floating-card-expand-inner">
                      <p className="floating-card-desc">{item.desc}</p>
                      <div className="floating-card-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="floating-pill-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}