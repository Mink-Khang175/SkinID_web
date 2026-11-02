import { useEffect, useState } from 'react';
import { DEFAULT_BLOG_ARTICLES } from '../../data/blogArticles.js';
import { fetchBlogPosts } from '../../features/content/index.js';

export default function HomeBlogTeaser() {
  const [articles, setArticles] = useState(DEFAULT_BLOG_ARTICLES);

  useEffect(() => {
    let mounted = true;
    fetchBlogPosts()
      .then((posts) => {
        if (mounted && Array.isArray(posts) && posts.length > 0) {
          setArticles(posts.filter((a) => (a.status || 'published') === 'published' && a.active !== false));
        }
      })
      .catch(() => {});

    const handleSync = (event) => {
      if (!mounted) return;
      if (event.detail?.posts && Array.isArray(event.detail.posts)) {
        setArticles(event.detail.posts.filter((a) => (a.status || 'published') === 'published' && a.active !== false));
      } else {
        fetchBlogPosts().then((posts) => {
          if (mounted && Array.isArray(posts)) {
            setArticles(posts.filter((a) => (a.status || 'published') === 'published' && a.active !== false));
          }
        }).catch(() => {});
      }
    };

    window.addEventListener('skinid:blog-updated', handleSync);
    window.addEventListener('skinid:blog-posts-updated', handleSync);
    return () => {
      mounted = false;
      window.removeEventListener('skinid:blog-updated', handleSync);
      window.removeEventListener('skinid:blog-posts-updated', handleSync);
    };
  }, []);

  const topArticles = articles.slice(0, 3);

  return <section className="skinid-journal-section" aria-label="Cẩm nang chăm sóc da khoa học"><div className="container">
    <div className="collection-section-heading"><div><span className="skinid-editorial-kicker">GÓC CHĂM DA · SKINID JOURNAL</span><h2 className="skinid-editorial-title">Hiểu làn da. <em>Chăm đúng cách.</em></h2></div><a href="/blog" className="collection-text-link">Khám phá cẩm nang <span aria-hidden="true">↗</span></a></div>
    <div className="journal-grid">{topArticles.map((article, index) => <article key={article.id} className="journal-card">
      <a href={`/blog/${article.slug || article.id}`} className="journal-card__image"><img src={article.image || '/images/products/placeholder.svg'} alt={article.title} loading="lazy" /><span>{article.stepLabel || 'Cẩm nang'}</span><b aria-hidden="true">0{index + 1}</b></a>
      <div className="journal-card__body"><span className="journal-card__meta">{article.date} · {article.readTime || '3 phút đọc'}</span><h3><a href={`/blog/${article.slug || article.id}`}>{article.title}</a></h3><p>{article.excerpt}</p><div className="journal-card__footer"><span>{article.author || 'SkinID Advisory'}</span><a href={`/blog/${article.slug || article.id}`} aria-label={`Đọc: ${article.title}`}>Đọc tiếp <span aria-hidden="true">↗</span></a></div></div>
    </article>)}</div>
  </div></section>;
}
