/**
 * Nội dung mặc định của website, tách khỏi lớp Firestore để cả frontend và
 * backend (skinid-backend/scripts/generate-seed.mjs) đọc được cùng một nguồn.
 *
 * Các giá trị vận hành nhạy cảm (endpoint/chi nhánh/quầy S3) vẫn nằm ở đây để
 * giao diện admin hiển thị, nhưng backend KHÔNG lưu chúng vào Postgres —
 * chúng chỉ được đọc từ biến môi trường phía server.
 */
import { CURATED_COMBOS, RETAIL_50_DEALS, CAMPAIGN_STEPS } from './promotions.js';
import { COMPANY_INFO } from './companyInfo.js';

export const DEFAULT_SYSTEM_SETTINGS = {
  brandName: COMPANY_INFO.brand,
  slogan: 'Healthier Skin, Happier You',
  hotline: COMPANY_INFO.hotlineDisplay,
  supportEmail: COMPANY_INFO.email,
  showroomAddress: COMPANY_INFO.address,
  freeshipThreshold: 500000,
  shippingFee: 30000,
  allowInspection: true,
  s3ApiEndpoint: 'https://m.es3.vn',
  s3BranchId: '9099',
  s3CashierId: '16614',
  s3AutoSync: true,
  soundAlertOrders: true,
  emailAlertUnpaid: true,
  ga4Id: '',
  gtmId: '',
  metaPixelId: '',
  gscVerification: ''
};

export const DEFAULT_CAMPAIGN = {
  id: 'twon_dvah_flashsale_2026',
  salesChannel: 'store',
  title: "Đại Tiệc Dưỡng Trắng & Hương Thơm — TWON x D'VAH",
  subtitle: 'Ưu Đãi Độc Quyền Đến 50% & Quà Tặng Nàng Thơ',
  badge: 'SIÊU SALE ĐẶC BIỆT',
  basisPolicy: 'Chính sách bán hàng Fieldman (15/04/2026)',
  steps: CAMPAIGN_STEPS,
  combos: CURATED_COMBOS,
  flashSale: RETAIL_50_DEALS,
  active: true
};

export const DEFAULT_HOME_BLOCKS = {
  banners: [
    {
      id: 'banner_scan_ai',
      label: 'TIỆN ÍCH SOI DA AI',
      title: 'Hiểu làn da trước khi chọn sản phẩm',
      subtitle: 'Chụp ảnh khuôn mặt theo hướng dẫn để tham khảo tình trạng da và tìm nhanh nhóm sản phẩm phù hợp.',
      desktopImage: '/images/banners/hero-scan-ai.jpg',
      mobileImage: '/images/banners/hero-scan-ai.jpg',
      alt: 'Minh họa tính năng soi da AI SkinID',
      ctaText: 'Bắt đầu soi da',
      ctaLink: '/skin-analysis',
      active: true,
      startAt: null,
      endAt: null
    },
    {
      id: 'banner_rilastil',
      label: 'RILASTIL · DƯỢC MỸ PHẨM TỪ Ý',
      title: 'Dịu dàng với da. Yêu thương chính mình.',
      subtitle: 'Sản phẩm rõ nguồn gốc, thông tin đầy đủ và phân loại dễ tìm theo từng nhu cầu.',
      desktopImage: '/images/banners/Rilastil_banner.png',
      mobileImage: '/images/banners/Rilastil_banner.png',
      alt: 'Bộ sản phẩm Rilastil chính ngạch từ Ý',
      ctaText: 'Mua sắm ngay',
      ctaLink: '/products',
      active: true,
      startAt: null,
      endAt: null
    },
    {
      id: 'banner_twon',
      label: 'TWON · BODY RITUAL',
      title: 'Chăm sóc cơ thể. Nâng niu mỗi ngày.',
      subtitle: 'Routine dưỡng thể mềm mịn và lưu hương nhẹ nhàng cho trải nghiệm chăm sóc trọn vẹn.',
      desktopImage: '/images/banners/Bộ mỹ phẩm TWON giữa sắc hoa anh đào.png',
      mobileImage: '/images/banners/Bộ mỹ phẩm TWON giữa sắc hoa anh đào.png',
      alt: 'Bộ sản phẩm dưỡng thể TWON',
      ctaText: 'Mua TWON ngay',
      ctaLink: '/products',
      active: true,
      startAt: null,
      endAt: null
    },
    {
      id: 'banner_dvah',
      label: "D'VAH · NƯỚC HOA TINH TẾ",
      title: 'Hương thơm kiêu kỳ. Dấu ấn khó phai.',
      subtitle: 'Bộ sưu tập nước hoa cao cấp lưu hương bền lâu và tôn vinh phong cách riêng biệt.',
      desktopImage: "/images/banners/Chai nước hoa D'VAH trên mặt nước trong suốt.png",
      mobileImage: "/images/banners/Chai nước hoa D'VAH trên mặt nước trong suốt.png",
      alt: "Nước hoa D'VAH cao cấp",
      ctaText: "Khám phá D'VAH",
      ctaLink: '/products',
      active: true,
      startAt: null,
      endAt: null
    }
  ],
  announcement: {
    text: 'Ưu đãi độc quyền SkinID: Freeship toàn quốc từ 500k · Phân tích da AI miễn phí',
    link: '/khuyen-mai',
    active: true
  },
  blockOrder: [
    'hero',
    'flash_sale',
    'featured_products',
    'help_section',
    'brand_showcase',
    'acie_teaser',
    'home_blog',
    'trust_benefits'
  ],
  blockVisibility: {
    hero: true,
    flash_sale: true,
    featured_products: true,
    help_section: true,
    brand_showcase: true,
    acie_teaser: true,
    home_blog: true,
    trust_benefits: true
  }
};
