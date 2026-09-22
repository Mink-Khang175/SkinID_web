function CatalogDropdown({ id, icon, label, options, value = 'all', kind, sort = false }) {
  const selected = options.find((option) => option.value === value) || options[0];
  return (
    <div className={`catalog-filter-select${sort ? ' catalog-filter-select--sort' : ''}`} data-catalog-dropdown data-filter-kind={kind}>
      <span><i data-feather={icon} aria-hidden="true"></i> {label}</span>
      <div className="catalog-dropdown">
        <input id={id} type="hidden" defaultValue={value} />
        <button className="catalog-dropdown__trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
          <span data-dropdown-label>{selected.label}</span><i data-feather="chevron-down" aria-hidden="true"></i>
        </button>
        <div className="catalog-dropdown__panel" role="listbox" aria-label={label} hidden>
          {options.map((option) => (
            <button key={option.value} className={`catalog-dropdown__option${option.value === value ? ' is-active' : ''}`} type="button" role="option" aria-selected={option.value === value} data-dropdown-value={option.value}>
              <span className="catalog-dropdown__check" aria-hidden="true">✓</span><span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const brandOptions = [
  { value: 'all', label: 'Tất cả thương hiệu' }, { value: 'rilastil', label: 'Rilastil' },
  { value: 'twon', label: 'TWON' }, { value: 'dvah', label: "D'VAH" }
];
const categoryOptions = [
  { value: 'all', label: 'Tất cả danh mục' }, { value: 'cleanser', label: 'Làm sạch' },
  { value: 'toner', label: 'Cân bằng' }, { value: 'treatment', label: 'Đặc trị' },
  { value: 'moisturizer', label: 'Dưỡng ẩm' }, { value: 'sunscreen', label: 'Chống nắng' },
  { value: 'special', label: 'Cơ thể & nước hoa' }
];
const sortOptions = [
  { value: 'featured', label: 'Nổi bật' }, { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' }
];

const benefitFilterChips = [
  { value: 'all', label: 'Tất cả' },
  { value: 'tri-mun-kiem-dau', label: 'Trị mụn & Kiềm dầu' },
  { value: 'sang-da-mo-tham', label: 'Sáng da & Mờ thâm' },
  { value: 'phuc-hoi-diu-da', label: 'Phục hồi da' },
  { value: 'chong-lao-hoa', label: 'Chống lão hóa' },
  { value: 'cap-am-chuyen-sau', label: 'Cấp ẩm sâu' },
  { value: 'chong-nang', label: 'Chống nắng' },
  { value: 'body-nuoc-hoa', label: 'Cơ thể & Nước hoa' }
];

export default function ProductList() {
  return (
    <>
      <section id="catalog" className="section catalog-section">
        <div className="container">
          <div id="featured-products" className="section-heading catalog-heading">
            <div>
              <span className="section-kicker">DANH MỤC SẢN PHẨM</span>
              <h2>Dược mỹ phẩm & Chăm sóc chuyên sâu</h2>
              <p>Khám phá sản phẩm chuẩn y khoa phù hợp với nhu cầu làn da của bạn.</p>
            </div>
          </div>

          {/* Primary Functional Filter Chips (Pill Bar) */}
          <div className="catalog-benefit-bar mb-4 overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" id="benefit-filters" role="tablist" aria-label="Lọc theo nhu cầu chức năng">
              {benefitFilterChips.map((chip, idx) => (
                <button
                  key={chip.value}
                  type="button"
                  role="tab"
                  aria-selected={idx === 0}
                  className={`benefit-filter-pill whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                    idx === 0
                      ? 'is-active bg-[#E85D75] text-white border-[#E85D75] shadow-xs'
                      : 'bg-white text-gray-700 border-rose-100 hover:border-rose-300 hover:bg-rose-50/50'
                  }`}
                  data-benefit={chip.value}
                  onClick={(e) => window.filterByBenefit?.(chip.value, e.currentTarget)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Toolbar: Result count & slender brand/step/sort dropdowns */}
          <div className="shop-toolbar flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100/80" aria-label="Bộ lọc và sắp xếp sản phẩm">
            <div id="filter-result-count" className="catalog-result-count text-xs font-medium text-gray-500">Đang tải sản phẩm…</div>
            <div className="catalog-filter-cluster flex items-center gap-2 ml-auto">
              <CatalogDropdown id="brand-filter-select" icon="tag" label="Thương hiệu" options={brandOptions} kind="brand" />
              <CatalogDropdown id="step-filter-select" icon="layers" label="Bước dưỡng" options={categoryOptions} kind="step" />
              <CatalogDropdown id="catalog-sort" icon="sliders" label="Sắp xếp" options={sortOptions} value="featured" kind="sort" sort />
            </div>
            <input id="product-search" type="hidden" />
          </div>

          <div id="product-grid" aria-live="polite"></div>
        </div>
      </section>
    </>
  );
}
