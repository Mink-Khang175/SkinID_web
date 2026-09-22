import { assetUrl } from '../../assets/index.js';

const curatedCombos = [
  {
    id: 'combo-acnestil-pb',
    badge: 'ƯU ĐÃI 20%',
    title: 'Bộ Đôi Kháng Khuẩn & Cân Bằng Dầu Acnestil',
    subtitle: 'Acnestil Mousse 150ml + Acnestil PB Soothing Gel 50ml',
    description: 'Làm sạch sâu dịu nhẹ và cân bằng hệ vi sinh da, hỗ trợ giảm mụn và kiểm soát bã nhờn chuẩn y khoa.',
    image: '/images/products/rilastil-gel-lam-diu-va-can-bang-dau-nhon-giam-mun-diu-nhe-50ml-rilastil-acnestil-pb-soothing-sebum-normalising-gel-50ml.avif',
    targetProductId: 'rilastil-2092',
    price: 1160000,
    originalPrice: 1450000
  },
  {
    id: 'combo-dclar-brightening',
    badge: 'ƯU ĐÃI 25%',
    title: 'Liệu Trình Mờ Thâm Nám Chuyên Sâu D-Clar',
    subtitle: 'D-Clar Micropeeling 100ml + D-Clar Drops 30ml',
    description: 'Tẩy da chết vi mô kết hợp tinh chất cô đặc làm mờ sạm nám, dưỡng da căng sáng đều màu từ Ý.',
    image: '/images/products/rilastil-dung-dich-tay-te-bao-chet-chuyen-sau-lam-sang-da-va-mo-tham-nam-100ml-rilastil-d-clar-concentrated-micropeeling-100ml.avif',
    targetProductId: 'rilastil-2090',
    price: 1837000,
    originalPrice: 2450000
  },
  {
    id: 'combo-sun-aqua',
    badge: 'ƯU ĐÃI 15%',
    title: 'Bộ Đôi Chống Nắng Phổ Rộng & Cấp Nước 72H',
    subtitle: 'Sun System Water Touch SPF50+ + Aqua Intense 72H',
    description: 'Màng lọc quang học chống tia UVA/UVB toàn diện kết hợp cấp ẩm đa tầng giữ da ẩm mượt cả ngày dài.',
    image: '/images/products/rilastil-kem-chong-nang-kiem-soat-dau-nhon-chong-bong-nhon-50ml-rilastil-sun-system-water-touch-fluid-matt-spf-50-50ml.avif',
    targetProductId: 'rilastil-2079',
    price: 1258000,
    originalPrice: 1480000
  }
];

export default function HotPromotion() {
  return (
    <section id="hot-promotion" className="section hot-promotion-section bg-[#FFF0F3]/60 py-12 md:py-16">
      <div className="container">
        <div className="section-heading text-center max-w-2xl mx-auto mb-10">
          <span className="section-kicker text-rose-600 uppercase tracking-widest text-xs font-bold">CURATED COLLECTION</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 tracking-tight">
            Combo Chăm Sóc Da Chuyên Sâu
          </h2>
          <p className="text-gray-600 text-sm md:text-base mt-2">
            Giải pháp phối hợp hoạt chất chuẩn da liễu từ các chuyên gia SkinID, tối ưu hiệu quả điều trị với mức giá ưu đãi đặc quyền.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {curatedCombos.map((combo) => (
            <div
              key={combo.id}
              className="group relative bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-rose-100/80 hover:shadow-md hover:border-rose-200 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Badge ưu đãi tinh tế */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider text-[#E85D75] bg-[#FFE4E8]">
                  {combo.badge}
                </span>
                <span className="text-[11px] font-medium text-gray-400">Combo Độc Quyền</span>
              </div>

              {/* Hình ảnh sản phẩm sạch sẽ */}
              <div
                className="relative aspect-square rounded-xl bg-gray-50/70 p-4 mb-5 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => window.openProductDetailModal?.(combo.targetProductId)}
              >
                <img
                  src={assetUrl(combo.image)}
                  alt={combo.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Nội dung thông tin ngắn gọn 2 dòng */}
              <div className="flex-1 flex flex-col">
                <h3
                  className="text-base font-bold text-gray-900 hover:text-[#E85D75] transition-colors cursor-pointer line-clamp-1"
                  onClick={() => window.openProductDetailModal?.(combo.targetProductId)}
                >
                  {combo.title}
                </h3>
                <p className="text-xs font-semibold text-rose-500 mt-1 line-clamp-1">{combo.subtitle}</p>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                  {combo.description}
                </p>

                {/* Giá & nút hành động */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">
                      {combo.price.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-xs text-gray-400 line-through">
                      {combo.originalPrice.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#E85D75] hover:bg-[#d64a63] transition-colors shadow-2xs cursor-pointer"
                    onClick={() => {
                      if (window.addToCart) {
                        window.addToCart(combo.targetProductId);
                      } else {
                        window.openProductDetailModal?.(combo.targetProductId);
                      }
                    }}
                  >
                    <span>Thêm vào giỏ</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
