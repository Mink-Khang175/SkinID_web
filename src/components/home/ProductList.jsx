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

export default function ProductList() {
  return (
    <>
<section id="catalog" className="section catalog-section">
  <div className="container">
    <div id="featured-products" className="section-heading catalog-heading">
      <div>
        <span className="section-kicker">SẢN PHẨM NỔI BẬT</span>
        <h2>Dược mỹ phẩm & chăm sóc cá nhân</h2>
        <p>Lọc nhanh theo thương hiệu và nhu cầu chăm sóc.</p>
      </div>
    </div>

    <div className="shop-toolbar" aria-label="Bộ lọc và sắp xếp sản phẩm">
      <div className="catalog-filter-cluster">
        <CatalogDropdown id="brand-filter-select" icon="tag" label="Thương hiệu" options={brandOptions} kind="brand" />
        <CatalogDropdown id="step-filter-select" icon="layers" label="Danh mục" options={categoryOptions} kind="step" />
      </div>
      <div id="filter-result-count" className="catalog-result-count">Đang tải sản phẩm…</div>
      <CatalogDropdown id="catalog-sort" icon="sliders" label="Sắp xếp" options={sortOptions} value="featured" kind="sort" sort />
      <input id="product-search" type="hidden" />
    </div>
    <div id="product-grid" aria-live="polite"></div>
  </div>
</section>
    </>
  );
}
