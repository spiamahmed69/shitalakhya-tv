import { Link } from 'react-router-dom'
import { categoryBySlug } from '../data/categories'
import { formatBnDate } from '../lib/articles'

// Original CSS gradient cover — no copied/external photos.
export function Cover({ article, size = 'md' }) {
  const cat = categoryBySlug(article.category)
  const h = size === 'lg' ? 'h-56 sm:h-72 md:h-96' : size === 'sm' ? 'h-32 sm:h-36' : 'h-40 sm:h-48'
  const big = size === 'lg' ? 'text-6xl sm:text-8xl' : 'text-4xl sm:text-5xl'
  if (article.imageUrl) {
    return (
      <div className={`relative w-full overflow-hidden bg-slate-200 ${h}`}>
        <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" loading="lazy" />
      </div>
    )
  }
  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-br ${cat.gradient} ${h}`}>
      <svg className="absolute inset-0 h-full w-full opacity-20" preserveAspectRatio="none" viewBox="0 0 400 200" aria-hidden="true">
        <path d="M0 120 C 60 90, 120 150, 200 120 S 340 90, 400 120 L 400 200 L 0 200 Z" fill="#fff" />
        <path d="M0 150 C 70 120, 140 180, 210 150 S 340 120, 400 150 L 400 200 L 0 200 Z" fill="#fff" opacity=".6" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-start justify-end p-3 sm:p-4">
        <span className={`font-extrabold text-white/90 ${big} leading-none`}>{cat.initial}</span>
        <span className="mt-1 rounded bg-black/30 px-2 py-0.5 text-xs font-semibold text-white">{cat.name}</span>
      </div>
    </div>
  )
}

export function SampleBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-300">
      নমুনা
    </span>
  )
}

export default function ArticleCard({ article, featured = false }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <Link to={`/khabar/${article.slug}`} className="block shrink-0" aria-label={article.title}>
        <Cover article={article} size={featured ? 'lg' : 'md'} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/category/${article.category}`} className="rounded bg-[#0B2A4A] px-2 py-0.5 text-xs font-bold text-white">
            {categoryBySlug(article.category).name}
          </Link>
          {article.isSample && <SampleBadge />}
          {article.breaking && (
            <span className="rounded bg-[#DC2626] px-2 py-0.5 text-xs font-bold text-white">ব্রেকিং</span>
          )}
        </div>
        <h3 className={`mt-2 font-bold leading-snug text-slate-900 ${featured ? 'text-lg sm:text-2xl' : 'text-base sm:text-lg'}`}>
          <Link to={`/khabar/${article.slug}`} className="hover:text-[#0E7490]">{article.title}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{article.summary}</p>
        <time className="mt-auto pt-3 text-xs text-slate-500">{formatBnDate(article.createdAt)}</time>
      </div>
    </article>
  )
}
