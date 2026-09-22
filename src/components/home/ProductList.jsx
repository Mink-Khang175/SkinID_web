function CatalogDropdown({ id, label, options, value = 'all', kind, sort = false }) {
  const selected = options.find((option) => option.value === value) || options[0];
  return (
    <div className={`catalog-filter-select${sort ? ' catalog-filter-select--sort' : ''}`} data-catalog-dropdown data-filter-kind={kind}>
      <div className="catalog-dropdown relative">
        <input id={id} type="hidden" defaultValue={value} />
        <button
          className="catalog-dropdown__trigger flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200/90 bg-white text-xs text-gray-700 hover:border-gray-300 transition-colors shadow-2xs cursor-pointer font-medium"
          type="button"
          aria-haspopup="listbox"
          aria-expanded="false"
        >
          <span className="text-gray-400 font-normal">{label}:</span>
          <span data-dropdown-label className="font-semibold text-gray-900">{selected.label}</span>
          <svg className="w-3.5 h-3.5 text-gray-400 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div className="catalog-dropdown__panel absolute top-full mt-1 right-0 min-w-[170px] bg-white rounded-xl shadow-lg border border-gray-100 p-1 z-30" role="listbox" aria-label={label} hidden>
          {options.map((option) => (
            <button
              key={option.value}
              className={`catalog-dropdown__option w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-gray-50 transition-colors${option.value === value ? ' is-active font-bold text-[#E85D75]' : ' text-gray-700'}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              data-dropdown-value={option.value}
            >
              <span>{option.label}</span>
              <span className="catalog-dropdown__check text-[#E85D75]" aria-hidden="true">✓</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const brandOptions = [
  { value: 'all', label: 'Tất cả' }, { value: 'rilastil', label: 'Rilastil' },
  { value: 'twon', label: 'TWON' }, { value: 'dvah', label: "D'VAH" }
];
const categoryOptions = [
  { value: 'all', label: 'Tất cả' }, { value: 'cleanser', label: 'Làm sạch' },
  { value: 'toner', label: 'Cân bằng' }, { value: 'treatment', label: 'Đặc trị' },
  { value: 'moisturizer', label: 'Dưỡng ẩm' }, { value: 'sunscreen', label: 'Chống nắng' },
  { value: 'special', label: 'Cơ thể & nước hoa' }
];
const sortOptions = [
  { value: 'featured', label: 'Nổi bật' }, { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' }
];

const benefitFilterTabs = [
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
          <div id="featured-products" className="section-heading catalog-heading mb-6">
            <div>
              <span className="section-kicker">DANH MỤC SẢN PHẨM</span>
              <h2>Dược mỹ phẩm & Chăm sóc chuyên sâu</h2>
              <p>Khám phá sản phẩm chuẩn y khoa phù hợp với nhu cầu làn da của bạn.</p>
            </div>
          </div>

          {/* Minimal Text Tabs with Red-Rose Underline Indicator */}
          <div className="catalog-benefit-tabs-wrapper border-b border-gray-200/80 mb-5 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-6 sm:gap-8 min-w-max" id="benefit-filters" role="tablist" aria-label="Lọc theo nhu cầu chức năng">
              {benefitFilterTabs.map((tab, idx) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={idx === 0}
                  className={`benefit-filter-tab pb-3.5 text-xs sm:text-sm transition-all cursor-pointer relative whitespace-nowrap border-b-2 -mb-[1px] ${
                    idx === 0
                      ? 'is-active text-gray-900 font-bold border-[#E85D75]'
                      : 'text-gray-500 font-medium hover:text-gray-900 border-transparent'
                  }`}
                  data-benefit={tab.value}
                  onClick={(e) => window.filterByBenefit?.(tab.value, e.currentTarget)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean 1-Row Toolbar: Result Count & Flat Dropdowns */}
          <div className="shop-toolbar flex flex-wrap items-center justify-between gap-3 mb-6" aria-label="Bộ lọc và sắp xếp sản phẩm">
            <div id="filter-result-count" className="catalog-result-count text-xs font-semibold text-gray-500">
              Đang tải sản phẩm…
            </div>
            <div className="catalog-filter-cluster flex flex-wrap items-center gap-2.5 ml-auto">
              <CatalogDropdown id="brand-filter-select" label="Thương hiệu" options={brandOptions} kind="brand" />
              <CatalogDropdown id="step-filter-select" label="Bước dưỡng" options={categoryOptions} kind="step" />
              <CatalogDropdown id="catalog-sort" label="Sắp xếp" options={sortOptions} value="featured" kind="sort" sort />
            </div>
            <input id="product-search" type="hidden" />
          </div>

          <div id="product-grid" aria-live="polite"></div>
        </div>
      </section>
    </>
  );
}
