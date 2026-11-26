import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'

function Logo() {
  return (
    <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2" aria-label="শীতলক্ষ্যা টিভি — হোম">
      <svg className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="12" fill="#0B2A4A" />
        <path d="M8 40c8-8 16 8 24 0s16 8 24 0" stroke="#2DD4BF" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M8 28c8-8 16 8 24 0s16 8 24 0" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7" />
      </svg>
      <span className="min-w-0 leading-none">
        <span className="block truncate text-xl font-extrabold text-white sm:text-2xl">শীতলক্ষ্যা</span>
        <span className="mt-0.5 flex items-center gap-1.5">
          <span className="rounded bg-[#DC2626] px-1.5 py-px text-[11px] font-extrabold tracking-wider text-white">TV</span>
          <span className="text-[11px] font-medium tracking-wide text-teal-200">SHITALAKHYA TV</span>
        </span>
      </span>
    </Link>
  )
}

function useBanglaDateTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const date = now.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' })
  const time = now.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Dhaka' })
  return { date, time }
}

export default function Header() {
  const { date, time } = useBanglaDateTime()
  const [menuOpen, setMenuOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  function onSearch(e) {
    e.preventDefault()
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <header className="sticky top-0 z-40">
      {/* Top bar: date/time */}
      <div className="bg-[#071E36] text-teal-100">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-3 py-1.5 text-xs sm:px-4 sm:text-sm">
          <span className="min-w-0 truncate">{date}</span>
          <span className="shrink-0 font-semibold tabular-nums">{time} • ঢাকা</span>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-[#0B2A4A] shadow-md">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-4">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-300 lg:hidden"
          >
            {menuOpen ? (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            )}
          </button>

          <Logo />

          {/* Search — desktop */}
          <form onSubmit={onSearch} className="ml-auto hidden min-w-0 flex-1 max-w-xs items-center md:flex" role="search">
            <label className="sr-only" htmlFor="search-desktop">খবর খুঁজুন</label>
            <input
              id="search-desktop"
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="খবর খুঁজুন…"
              className="h-11 w-full min-w-0 rounded-l-lg border-0 bg-white/95 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <button type="submit" className="h-11 shrink-0 rounded-r-lg bg-[#0E7490] px-4 text-sm font-bold text-white hover:bg-[#0a5c72]">খুঁজুন</button>
          </form>

          <Link to="/live-tv" className="ml-auto flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#DC2626] px-3 text-sm font-bold text-white hover:bg-[#b91c1c] sm:px-4 md:ml-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            লাইভ টিভি
          </Link>
        </div>

        {/* Search — mobile, full width under header row */}
        <div className="px-3 pb-2.5 md:hidden">
          <form onSubmit={onSearch} className="flex items-center" role="search">
            <label className="sr-only" htmlFor="search-mobile">খবর খুঁজুন</label>
            <input
              id="search-mobile"
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="খবর খুঁজুন…"
              className="h-11 w-full min-w-0 rounded-l-lg border-0 bg-white/95 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <button type="submit" className="h-11 shrink-0 rounded-r-lg bg-[#0E7490] px-4 text-sm font-bold text-white">খুঁজুন</button>
          </form>
        </div>

        {/* Desktop nav */}
        <nav className="hidden border-t border-white/10 bg-[#0B2A4A] lg:block" aria-label="ক্যাটাগরি">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center px-4">
            <Link to="/" className="px-3 py-2.5 text-sm font-bold text-white hover:bg-white/10">হোম</Link>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} to={`/category/${c.slug}`} className="px-3 py-2.5 text-sm font-semibold text-slate-100 hover:bg-white/10 hover:text-white">{c.name}</Link>
            ))}
            <Link to="/admin" className="ml-auto px-3 py-2.5 text-sm font-semibold text-teal-200 hover:bg-white/10">অ্যাডমিন</Link>
          </div>
        </nav>

        {/* Mobile nav — hamburger panel */}
        {menuOpen && (
          <nav className="border-t border-white/10 bg-[#0B2A4A] lg:hidden" aria-label="মোবাইল মেনু">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-1 px-3 py-3 sm:grid-cols-3">
              <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-lg bg-white/10 px-3 py-3 text-sm font-bold text-white">হোম</Link>
              {CATEGORIES.map((c) => (
                <Link key={c.slug} to={`/category/${c.slug}`} onClick={() => setMenuOpen(false)} className="rounded-lg bg-white/5 px-3 py-3 text-sm font-semibold text-slate-100 hover:bg-white/10">{c.name}</Link>
              ))}
              <Link to="/live-tv" onClick={() => setMenuOpen(false)} className="rounded-lg bg-[#DC2626]/20 px-3 py-3 text-sm font-bold text-red-100">লাইভ টিভি</Link>
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="rounded-lg bg-white/5 px-3 py-3 text-sm font-semibold text-teal-200">অ্যাডমিন</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
