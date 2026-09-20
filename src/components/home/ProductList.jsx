export default function ProductList() {
  return (
    <>
<section id="catalog" className="section catalog-section">
  <div className="container">
    <div className="section-heading catalog-heading">
      <div>
        <span className="section-kicker">SẢN PHẨM NỔI BẬT</span>
        <h2>Dược mỹ phẩm & chăm sóc cá nhân</h2>
        <p>Lọc nhanh theo thương hiệu và nhu cầu chăm sóc.</p>
      </div>
    </div>

    <div className="shop-toolbar" aria-label="Bộ lọc và sắp xếp sản phẩm">
      <div className="catalog-filter-cluster">
        <label className="catalog-filter-select">
          <span><i data-feather="tag" aria-hidden="true"></i> Thương hiệu</span>
          <span className="catalog-select-control">
            <select id="brand-filter-select" defaultValue="all">
              <option value="all">Tất cả thương hiệu</option>
              <option value="rilastil">Rilastil</option>
              <option value="twon">TWON</option>
              <option value="dvah">D'VAH</option>
            </select>
            <i data-feather="chevron-down" aria-hidden="true"></i>
          </span>
        </label>
        <label className="catalog-filter-select">
          <span><i data-feather="layers" aria-hidden="true"></i> Danh mục</span>
          <span className="catalog-select-control">
            <select id="step-filter-select" defaultValue="all">
              <option value="all">Tất cả danh mục</option>
              <option value="cleanser">Làm sạch</option>
              <option value="toner">Cân bằng</option>
              <option value="treatment">Đặc trị</option>
              <option value="moisturizer">Dưỡng ẩm</option>
              <option value="sunscreen">Chống nắng</option>
              <option value="special">Cơ thể & nước hoa</option>
            </select>
            <i data-feather="chevron-down" aria-hidden="true"></i>
          </span>
        </label>
      </div>
      <div id="filter-result-count" className="catalog-result-count">Đang tải sản phẩm…</div>
      <label className="catalog-filter-select catalog-filter-select--sort">
        <span><i data-feather="sliders" aria-hidden="true"></i> Sắp xếp</span>
        <span className="catalog-select-control">
          <select id="catalog-sort" defaultValue="featured">
            <option value="featured">Nổi bật</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
          </select>
          <i data-feather="chevron-down" aria-hidden="true"></i>
        </span>
      </label>
      <input id="product-search" type="hidden" />
    </div>
    <div id="product-grid" aria-live="polite"></div>
  </div>
</section>
    </>
  );
}
