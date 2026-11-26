import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ArticleCard from '../components/ArticleCard'
import { getArticles, searchArticles } from '../lib/articles'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getArticles()
      .then((all) => setResults(searchArticles(all, q)))
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <h1 className="border-b-2 border-[#0B2A4A] pb-3 text-xl font-extrabold text-[#0B2A4A] sm:text-2xl">
          খোঁজার ফলাফল: <span className="text-[#0E7490]">“{q}”</span>
        </h1>
        {loading && <p className="py-16 text-center text-slate-500">খুঁজছি…</p>}
        {!loading && results.length === 0 && (
          <div className="mt-6 rounded-xl bg-white p-8 text-center ring-1 ring-slate-200">
            <p className="font-bold text-slate-900">কোনো খবর পাওয়া যায়নি</p>
            <p className="mt-2 text-sm text-slate-600">অন্য কোনো শব্দ দিয়ে আবার খুঁজে দেখুন।</p>
            <Link to="/" className="mt-4 inline-block rounded-lg bg-[#0B2A4A] px-4 py-2.5 text-sm font-bold text-white">হোমপেজে যান</Link>
          </div>
        )}
        {!loading && results.length > 0 && (
          <p className="mt-4 text-sm text-slate-600">{results.length}টি খবর পাওয়া গেছে।</p>
        )}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((a) => <ArticleCard key={a.slug} article={a} />)}
        </div>
      </main>
      <Footer />
    </div>
  )
}
