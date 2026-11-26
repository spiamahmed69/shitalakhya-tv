import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Ticker from '../components/Ticker'
import ArticleCard, { Cover } from '../components/ArticleCard'
import Footer from '../components/Footer'
import { CATEGORIES } from '../data/categories'
import { getArticles } from '../lib/articles'
import { isFirebaseConfigured } from '../lib/firebase'

export default function Home() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getArticles()
      .then(setArticles)
      .catch((e) => setError(e.message || 'খবর লোড করা যায়নি।'))
      .finally(() => setLoading(false))
  }, [])

  const featured = articles[0]
  const side = articles.slice(1, 5)
  const latest = articles.slice(0, 8)

  return (
    <div className="min-h-screen">
      <Header />
      <Ticker articles={articles} />

      <main className="mx-auto w-full max-w-7xl px-3 sm:px-4">
        {/* Demo / sample notice */}
        {!isFirebaseConfigured && (
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-300 sm:p-4">
            <strong>ডেমো মোড:</strong> এই সাইটের খবরগুলো এখন <strong>নমুনা</strong> — আসল খবর অ্যাডমিন প্যানেল থেকে যোগ করা হবে।
            Firebase যুক্ত হলে নমুনা খবর আর দেখাবে না।
          </div>
        )}
        {isFirebaseConfigured && articles.some((a) => a.isSample) && (
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-300">
            কিছু খবরে "নমুনা" লেবেল আছে — সেগুলো আসল খবর নয়।
          </div>
        )}

        {loading && <p className="py-16 text-center text-slate-500">খবর লোড হচ্ছে…</p>}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
            {error} <button type="button" onClick={() => window.location.reload()} className="font-bold underline">আবার চেষ্টা করুন</button>
          </div>
        )}

        {!loading && !error && featured && (
          <>
            {/* Hero */}
            <section className="mt-4 grid gap-4 lg:grid-cols-3" aria-label="প্রধান খবর">
              <article className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                <Link to={`/khabar/${featured.slug}`} className="block">
                  <Cover article={featured} size="lg" />
                </Link>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/category/${featured.category}`} className="rounded bg-[#0B2A4A] px-2 py-0.5 text-xs font-bold text-white">
                      {CATEGORIES.find((c) => c.slug === featured.category)?.name}
                    </Link>
                    {featured.isSample && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-300">নমুনা</span>}
                    {featured.breaking && <span className="rounded bg-[#DC2626] px-2 py-0.5 text-xs font-bold text-white">ব্রেকিং</span>}
                  </div>
                  <h1 className="mt-2 text-xl font-extrabold leading-snug text-slate-900 sm:text-3xl">
                    <Link to={`/khabar/${featured.slug}`} className="hover:text-[#0E7490]">{featured.title}</Link>
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{featured.summary}</p>
                </div>
              </article>

              <aside className="flex flex-col gap-3" aria-label="অন্যান্য প্রধান খবর">
                {side.map((a) => (
                  <Link key={a.slug} to={`/khabar/${a.slug}`} className="flex min-w-0 gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 hover:shadow-md">
                    <div className="w-24 shrink-0 overflow-hidden rounded-lg sm:w-28">
                      <Cover article={a} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0E7490]">{CATEGORIES.find((c) => c.slug === a.category)?.name}</span>
                      {a.isSample && <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-bold text-amber-800">নমুনা</span>}
                      <h2 className="mt-0.5 line-clamp-3 text-sm font-bold leading-snug text-slate-900 sm:text-base">{a.title}</h2>
                    </div>
                  </Link>
                ))}
              </aside>
            </section>

            {/* Latest */}
            <section className="mt-8" aria-label="সর্বশেষ খবর">
              <div className="mb-4 flex items-center gap-3 border-b-2 border-[#0B2A4A] pb-2">
                <h2 className="shrink-0 text-lg font-extrabold text-[#0B2A4A] sm:text-xl">সর্বশেষ খবর</h2>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {latest.map((a) => <ArticleCard key={a.slug} article={a} />)}
              </div>
            </section>

            {/* Category sections */}
            {CATEGORIES.map((cat) => {
              const list = articles.filter((a) => a.category === cat.slug).slice(0, 4)
              if (!list.length) return null
              return (
                <section key={cat.slug} className="mt-8" aria-label={cat.name}>
                  <div className="mb-4 flex items-center gap-3 border-b-2 border-[#0B2A4A] pb-2">
                    <h2 className="shrink-0 text-lg font-extrabold text-[#0B2A4A] sm:text-xl">{cat.name}</h2>
                    <span className="h-px flex-1 bg-slate-200" />
                    <Link to={`/category/${cat.slug}`} className="shrink-0 rounded-lg bg-[#0E7490] px-3 py-1.5 text-xs font-bold text-white sm:text-sm">সব দেখুন →</Link>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {list.map((a) => <ArticleCard key={a.slug} article={a} />)}
                  </div>
                </section>
              )
            })}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
