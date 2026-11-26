import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ArticleCard from '../components/ArticleCard'
import { categoryBySlug } from '../data/categories'
import { getArticles } from '../lib/articles'

export default function CategoryPage() {
  const { slug } = useParams()
  const cat = categoryBySlug(slug)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getArticles()
      .then((all) => setList(all.filter((a) => a.category === slug)))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <p className="text-sm text-slate-500"><Link to="/" className="hover:underline">হোম</Link> / ক্যাটাগরি</p>
        <h1 className="mt-2 border-b-2 border-[#0B2A4A] pb-3 text-2xl font-extrabold text-[#0B2A4A] sm:text-3xl">{cat.name}</h1>
        {loading && <p className="py-16 text-center text-slate-500">খবর লোড হচ্ছে…</p>}
        {!loading && list.length === 0 && (
          <div className="mt-6 rounded-xl bg-white p-8 text-center ring-1 ring-slate-200">
            <p className="font-bold text-slate-900">এই ক্যাটাগরিতে এখনো কোনো খবর নেই</p>
            <p className="mt-2 text-sm text-slate-600">অ্যাডমিন প্যানেল থেকে খবর যোগ করলে এখানে দেখাবে।</p>
          </div>
        )}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((a) => <ArticleCard key={a.slug} article={a} />)}
        </div>
      </main>
      <Footer />
    </div>
  )
}
