import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ArticleCard, { Cover, SampleBadge } from '../components/ArticleCard'
import { categoryBySlug } from '../data/categories'
import { formatBnDate, getArticleBySlug, getArticles, relatedArticles } from '../lib/articles'

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getArticleBySlug(slug)
      .then(async (a) => {
        setArticle(a)
        if (a) setRelated(relatedArticles(await getArticles(), a, 4))
      })
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
        <Link to="/" className="inline-block rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#0B2A4A] ring-1 ring-slate-200">← হোমে ফিরুন</Link>
        {loading && <p className="py-16 text-center text-slate-500">খবর লোড হচ্ছে…</p>}
        {!loading && !article && (
          <div className="mt-6 rounded-xl bg-white p-8 text-center ring-1 ring-slate-200">
            <p className="text-xl font-bold text-slate-900">খবরটি পাওয়া যায়নি</p>
            <p className="mt-2 text-sm text-slate-600">লিংকটি ভুল হতে পারে, অথবা খবরটি সরিয়ে দেওয়া হয়েছে।</p>
            <Link to="/" className="mt-4 inline-block rounded-lg bg-[#0B2A4A] px-4 py-2.5 text-sm font-bold text-white">হোমপেজে যান</Link>
          </div>
        )}
        {!loading && article && (
          <article className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <Cover article={article} size="lg" />
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/category/${article.category}`} className="rounded bg-[#0B2A4A] px-2 py-0.5 text-xs font-bold text-white">{categoryBySlug(article.category).name}</Link>
                {article.isSample && <SampleBadge />}
                {article.breaking && <span className="rounded bg-[#DC2626] px-2 py-0.5 text-xs font-bold text-white">ব্রেকিং</span>}
              </div>
              <h1 className="mt-3 text-2xl font-extrabold leading-snug text-slate-900 sm:text-3xl">{article.title}</h1>
              <p className="mt-2 text-sm text-slate-500">{formatBnDate(article.createdAt)} • শীতলক্ষ্যা টিভি</p>
              {article.isSample && (
                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-300">
                  এটি একটি <strong>নমুনা খবর</strong> — আসল খবর নয়। আসল খবর অ্যাডমিন প্যানেল থেকে যোগ করা হবে।
                </p>
              )}
              <p className="mt-4 text-base font-semibold leading-relaxed text-slate-700 sm:text-lg">{article.summary}</p>
              <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                {article.body.map((para, i) => (
                  <p key={i} className="text-base leading-relaxed text-slate-700 sm:text-lg">{para}</p>
                ))}
              </div>
            </div>
          </article>
        )}
        {related.length > 0 && (
          <section className="mt-8" aria-label="সম্পর্কিত খবর">
            <h2 className="mb-4 border-b-2 border-[#0B2A4A] pb-2 text-lg font-extrabold text-[#0B2A4A] sm:text-xl">সম্পর্কিত খবর</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {related.map((a) => <ArticleCard key={a.slug} article={a} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
