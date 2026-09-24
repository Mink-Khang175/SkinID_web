function CatalogDropdown({ id, label, options, value = 'all', kind, sort = false }) {
  const selected = options.find((option) => option.value === value) || options[0];
  return (
    <div className={`catalog-filter-select${sort ? ' catalog-filter-select--sort' : ''}`} data-catalog-dropdown data-filter-kind={kind} data-default-label={sort ? '' : label}>
      <div className="catalog-dropdown">
        <input id={id} type="hidden" defaultValue={value} />
        <button className="catalog-dropdown__trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label={`Lọc theo ${label.toLowerCase()}`}>
          <span data-dropdown-label>{value === 'all' && !sort ? label : selected.label}</span><i data-feather="chevron-down" aria-hidden="true"></i>
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
const benefitOptions = [
  { value: 'all', label: 'Tất cả nhu cầu' },
  { value: 'tri-mun-kiem-dau', label: 'Da dầu & mụn' },
  { value: 'cap-am-chuyen-sau', label: 'Da khô & cấp ẩm' },
  { value: 'phuc-hoi-diu-da', label: 'Phục hồi & làm dịu' },
  { value: 'sang-da-mo-tham', label: 'Sáng da & mờ thâm' },
  { value: 'chong-lao-hoa', label: 'Chống lão hóa' },
  { value: 'chong-nang', label: 'Bảo vệ khỏi nắng' },
  { value: 'body-nuoc-hoa', label: 'Cơ thể & nước hoa' }
];
const sortOptions = [
  { value: 'featured', label: 'Nổi bật' }, { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' }
];

export default function ProductList() {
  return (
    <>
      <section id="catalog" className="section catalog-section">
        <div className="container">
          <label id="catalog-search" className="catalog-search">
            <i className="catalog-search__icon" data-feather="search" aria-hidden="true"></i>
            <span className="sr-only">Tìm sản phẩm</span>
            <input id="product-search" type="search" placeholder="Tìm theo tên sản phẩm, thương hiệu, thành phần…" />
          </label>
          <div className="shop-toolbar" aria-label="Bộ lọc và sắp xếp sản phẩm">
            <div className="catalog-filter-cluster">
              <CatalogDropdown id="brand-filter-select" label="Thương hiệu" options={brandOptions} kind="brand" />
              <CatalogDropdown id="step-filter-select" label="Danh mục" options={categoryOptions} kind="step" />
              <CatalogDropdown id="benefit-filter-select" label="Nhu cầu" options={benefitOptions} kind="benefit" />
            </div>
            <div id="filter-result-count" className="catalog-result-count">Đang tải sản phẩm…</div>
            <CatalogDropdown id="catalog-sort" label="Sắp xếp" options={sortOptions} value="featured" kind="sort" sort />
            <button className="catalog-reset" type="button" onClick={() => window.resetAllFilters?.()}>Xóa bộ lọc</button>
          </div>
          <div id="product-grid" aria-live="polite"></div>
        </div>
      </section>
    </>
  );
}
