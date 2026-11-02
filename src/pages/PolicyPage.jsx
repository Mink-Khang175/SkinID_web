import { Link, useLocation, useParams } from 'react-router-dom';
import StorefrontPage from '../components/layout/StorefrontPage.jsx';
import { COMPANY_INFO, LEGAL_POLICIES, POLICY_LIST } from '../data/legalPolicies.js';
import PolicyContentRenderer from '../components/policies/PolicyContentRenderer.jsx';
import usePageMetadata from '../hooks/usePageMetadata.js';
import '../styles/policy-v2.css';

function PolicyBlocks({ blocks }) {
  return blocks.map((block, index) => block.type === 'table'
    ? <div className="policy-table-scroll" key={index} role="region" aria-label={block.headers.join(' — ')} tabIndex={0}><table><thead><tr>{block.headers.map((label,i) => <th key={i} scope="col">{label}</th>)}</tr></thead><tbody>{block.rows.map((row,i) => <tr key={i}>{row.map((cell,j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>
    : <PolicyContentRenderer key={index} content={block.content} />);
}

export default function PolicyPage() {
  const { policySlug } = useParams();
  const { pathname } = useLocation();
  const slug = policySlug || pathname.replace(/^\/+|\/+$/g,'');
  const policy = LEGAL_POLICIES[slug === 'quy-trinh-khieu-nai' ? 'chinh-sach-doi-tra' : slug];
  usePageMetadata({ title: policy?.seoTitle || 'Không tìm thấy chính sách — SkinID.vn', description: policy?.seoDesc || 'Bộ chính sách SkinID V2.0.' });
  if (!policy) return <StorefrontPage><h1>Không tìm thấy chính sách</h1><Link to="/thong-tin-don-vi-van-hanh">Xem bộ chính sách SkinID</Link></StorefrontPage>;
  return <StorefrontPage><nav className="updates-breadcrumb"><Link to="/">Trang chủ</Link> / Chính sách & Quy định / {policy.shortTitle}</nav><div className="policy-v2-layout"><aside className="policy-v2-sidebar"><nav aria-label="Bộ chính sách SkinID V2.0"><h2>CHÍNH SÁCH SKINID <span>V2.0</span></h2>{POLICY_LIST.map(item => <Link key={item.slug} to={`/${item.slug}`} aria-current={item.slug === policy.slug ? 'page' : undefined}><span>{item.number === 0 ? 'ℹ' : String(item.number).padStart(2,'0')}</span>{item.shortTitle}{item.status === 'planned' && <small>Dự kiến</small>}</Link>)}</nav><div className="policy-v2-contact"><h3>Cần hỗ trợ?</h3><a href="tel:+84924093461">{COMPANY_INFO.hotlineDisplay}</a><a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a><p>{COMPANY_INFO.workingHours}</p></div></aside><article className="policy-v2-document"><header><span className="updates-kicker skinid-editorial-kicker">BỘ CHÍNH SÁCH & ĐIỀU KHOẢN · PHIÊN BẢN 2.0</span><h1>{policy.title}</h1><p>{COMPANY_INFO.name} · Ngày hiệu lực: {policy.effectiveDate}</p></header>{!!policy.pendingFields.length && <div className="policy-v2-pending" role="note">Một số thông tin trong dấu [ ] của tài liệu V2.0 đang chờ xác nhận. Vui lòng liên hệ SkinID nếu cần làm rõ trước khi sử dụng dịch vụ liên quan.</div>}{policy.status === 'planned' && <div className="policy-v2-pending" role="note">Chính sách dự kiến dành cho thiết bị soi da. Thiết bị hiện được giới thiệu ở trạng thái sắp ra mắt; chưa áp dụng cho đơn mua mỹ phẩm.</div>}<PolicyBlocks blocks={policy.intro} />{policy.sections.map(section => <section id={section.id} key={section.id}><h2>{section.heading}</h2><PolicyBlocks blocks={section.blocks} /></section>)}<footer className="policy-v2-document-footer"><p>Phiên bản 2.0 · {policy.shortTitle}</p><a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); }}>Về đầu trang ↑</a></footer></article></div></StorefrontPage>;
}
