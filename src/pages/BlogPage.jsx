import { useEffect, useMemo, useState } from 'react';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import ProductDetailModal from '../features/catalog/ProductDetailModal.jsx';
import { DEFAULT_BLOG_ARTICLES } from '../data/blogArticles.js';
import { fetchBlogPosts } from '../features/content/index.js';
import { assetUrl } from '../assets/index.js';
import usePageMetadata from '../hooks/usePageMetadata.js';

const ROUTINE_TABS = [
  { id: 'all', number: '', label: 'Tất cả bài viết' },
  { id: 'cleanser', number: '01', label: 'Làm sạch' },
  { id: 'treatment', number: '02', label: 'Tinh chất & HA' },
  { id: 'moisturizer', number: '03', label: 'Khóa ẩm 72H' },
  { id: 'sunscreen', number: '04', label: 'Chống nắng' }
];

const PAGE_SIZE = 8;

function readInitialBlogArticles() {
  return DEFAULT_BLOG_ARTICLES;
}

function ArticleCard({ article, featured = false, index = 0 }) {
  const href = `/blog/${article.slug || article.id}`;
  const isCutout = String(article.image || '').startsWith('/images/products/');
  return (
    <article className={`journal-post${featured ? ' journal-post--featured' : ''}`} style={{ '--i': index }}>
      <a className={`journal-post__media${isCutout ? ' is-cutout' : ''}`} href={href} tabIndex={-1} aria-hidden="true">
        <img src={assetUrl(article.image) || undefined} alt="" loading={featured ? 'eager' : 'lazy'} />
        {article.stepLabel && <span className="journal-post__step">{article.stepLabel}</span>}
      </a>
      <div className="journal-post__body">
        {featured && <span className="journal-post__badge">Bài viết nổi bật</span>}
        <div className="journal-post__meta">
          {article.readTime && <span>{article.readTime}</span>}
          {article.readTime && article.date && <i aria-hidden="true" />}
          {article.date && <span>{article.date}</span>}
        </div>
        <h2><a href={href}>{article.title}</a></h2>
        <p>{article.excerpt}</p>
        <div className="journal-post__foot">
          <span className="journal-post__author">Bởi {article.author}</span>
          <a className="journal-post__more" href={href} aria-label={`Đọc: ${article.title}`}>Đọc tiếp <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>
  );
}

export default function BlogPage() {
  usePageMetadata({
    title: 'Cẩm Nang Chăm Sóc Da & Kiến Thức Skincare Khoa Học — SkinID.vn',
    description: 'Cẩm nang chăm sóc da khoa học theo 4 bước routine: Làm sạch, Tinh chất, Khóa ẩm, Bảo vệ từ đội ngũ chuyên gia SkinID.'
  });

  const [articles, setArticles] = useState(readInitialBlogArticles);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeTab, searchQuery]);

  useEffect(() => {
    let mounted = true;
    fetchBlogPosts()
      .then((posts) => {
        if (mounted && Array.isArray(posts) && posts.length > 0) setArticles(posts);
      })
      .catch(() => {});

    const handleSync = () => {
      const updated = readInitialBlogArticles();
      if (mounted && updated?.length) setArticles(updated);
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('skinid:blog-updated', handleSync);
    return () => {
      mounted = false;
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('skinid:blog-updated', handleSync);
    };
  }, []);

  const publishedArticles = useMemo(
    () => articles.filter((a) => (a.status || 'published') === 'published' && a.active !== false),
    [articles]
  );

  const counts = useMemo(() => {
    const result = { all: publishedArticles.length };
    publishedArticles.forEach((a) => { result[a.step] = (result[a.step] || 0) + 1; });
    return result;
  }, [publishedArticles]);

  const query = searchQuery.trim().toLowerCase();
  const filteredArticles = publishedArticles.filter((article) => {
    if (activeTab !== 'all' && article.step !== activeTab) return false;
    if (!query) return true;
    return ['title', 'excerpt', 'author'].some((key) => String(article[key] || '').toLowerCase().includes(query));
  });

  const showFeatured = activeTab === 'all' && !query && filteredArticles.length > 2;
  const [featuredArticle, ...restArticles] = showFeatured ? filteredArticles : [null, ...filteredArticles];
  const visibleArticles = restArticles.slice(0, visibleCount);
  const resetFilters = () => { setActiveTab('all'); setSearchQuery(''); };

  return (
    <>
      <OfferBar />
      <Header />
      <main className="blog-page skinid-content-page ambient-page-canvas journal-page">
        <div className="container">
          <nav className="catalog-breadcrumb" aria-label="Đường dẫn">
            <a href="/">Trang chủ</a>
            <span aria-hidden="true">/</span>
            <span>Cẩm nang Skincare</span>
          </nav>

          <header className="journal-hero">
            <div className="journal-hero__copy">
              <span className="skinid-editorial-kicker">SKINID SKINCARE JOURNAL</span>
              <h1 className="skinid-editorial-title">Hiểu làn da. <em>Chăm đúng cách.</em></h1>
              <p>Phân tích thành phần minh bạch, giải mã hoạt chất dưỡng da và hướng dẫn thiết lập chu trình skincare 4 bước cùng đội ngũ chuyên gia SkinID.</p>
            </div>
            <ol className="journal-hero__steps" aria-hidden="true">
              {ROUTINE_TABS.slice(1).map((tab) => (
                <li key={tab.id}><b>{tab.number}</b><span>{tab.label}</span></li>
              ))}
            </ol>
          </header>

          <div className="journal-toolbar">
            <div className="journal-filters" role="group" aria-label="Lọc theo bước routine">
              {ROUTINE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={activeTab === tab.id}
                  className="journal-filter"
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.number && <span className="journal-filter__num">{tab.number}</span>}
                  {tab.label}
                  <small>{counts[tab.id] || 0}</small>
                </button>
              ))}
            </div>
            <label className="journal-search">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Tìm kiếm bài viết"
                placeholder="Tìm bài viết, hoạt chất…"
              />
            </label>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="journal-empty">
              <strong>Chưa có bài viết phù hợp.</strong>
              <p>Thử đổi từ khóa hoặc chọn bước routine khác nhé.</p>
              <button type="button" className="btn btn--primary" onClick={resetFilters}>Xem tất cả bài viết</button>
            </div>
          ) : (
            <>
              <p className="journal-count" role="status" aria-live="polite">{filteredArticles.length} bài viết</p>
              {featuredArticle && <ArticleCard article={featuredArticle} featured />}
              <div className="journal-posts">
                {visibleArticles.map((article, index) => <ArticleCard key={article.id} article={article} index={index % PAGE_SIZE} />)}
              </div>
              {restArticles.length > visibleCount && (
                <div className="journal-more">
                  <button type="button" className="btn btn--secondary" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
                    Xem thêm bài viết <small>({restArticles.length - visibleCount})</small>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
      <StorefrontModals />
      <ProductDetailModal />
    </>
  );
}
