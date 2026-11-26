import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'
import { CATEGORIES } from '../data/categories'
import { getAllArticlesAdmin, removeArticle, saveArticle, saveCategory, slugify } from '../lib/articles'
import Header from '../components/Header'
import Footer from '../components/Footer'

const EMPTY = { title: '', category: 'jatiyo', summary: '', body: '', breaking: false, published: true, imageUrl: '' }

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [articles, setArticles] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', slug: '' })
  const [catMsg, setCatMsg] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) return
    return onAuthStateChanged(auth, setUser)
  }, [])

  async function load() {
    setArticles(await getAllArticlesAdmin())
  }
  useEffect(() => { if (user) load() }, [user])

  async function onLogin(e) {
    e.preventDefault()
    setLoginError('')
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch {
      setLoginError('লগইন হয়নি — ইমেইল বা পাসওয়ার্ড ভুল হতে পারে।')
    }
  }

  async function onUpload(file) {
    if (!file) return
    setUploading(true)
    setMsg('')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'আপলোড হয়নি।')
      setForm((f) => ({ ...f, imageUrl: data.url }))
      setMsg('ছবি আপলোড হয়েছে।')
    } catch (err) {
      setMsg('ছবি আপলোড হয়নি: ' + err.message + ' — নিচে ছবির URL বসিয়ে দিতে পারেন।')
    } finally {
      setUploading(false)
    }
  }

  async function onSave(e) {
    e.preventDefault()
    if (!form.title.trim()) { setMsg('শিরোনাম লিখুন।'); return }
    const slug = editing?.slug || slugify(form.title)
    const article = {
      id: editing?.id || slug,
      slug,
      title: form.title.trim(),
      category: form.category,
      summary: form.summary.trim(),
      body: form.body.split('\n').map((s) => s.trim()).filter(Boolean),
      breaking: form.breaking,
      published: form.published,
      imageUrl: form.imageUrl.trim() || null,
      isSample: false,
      createdAt: editing?.createdAt || new Date().toISOString(),
    }
    try {
      await saveArticle(article)
      setMsg('খবর সংরক্ষণ হয়েছে।')
      setForm(EMPTY)
      setEditing(null)
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  function onEdit(a) {
    setEditing(a)
    setForm({
      title: a.title, category: a.category, summary: a.summary || '',
      body: (a.body || []).join('\n'), breaking: !!a.breaking, published: a.published !== false,
      imageUrl: a.imageUrl || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function onDelete(a) {
    if (!window.confirm(`"${a.title}" — খবরটি মুছে ফেলবেন?`)) return
    await removeArticle(a.id || a.slug)
    load()
  }

  async function onAddCategory(e) {
    e.preventDefault()
    if (!newCat.name.trim() || !newCat.slug.trim()) { setCatMsg('নাম ও স্লাগ দুটোই লিখুন।'); return }
    try {
      await saveCategory({ name: newCat.name.trim(), slug: newCat.slug.trim().toLowerCase() })
      setCatMsg('ক্যাটাগরি সংরক্ষণ হয়েছে। (নতুন ক্যাটাগরি সাইটের মেনুতে দেখাতে কোডে যোগ করতে হবে।)')
      setNewCat({ name: '', slug: '' })
    } catch (err) {
      setCatMsg(err.message)
    }
  }

  const inputCls = 'h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7490]'

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4">
        <h1 className="border-b-2 border-[#0B2A4A] pb-3 text-2xl font-extrabold text-[#0B2A4A] sm:text-3xl">অ্যাডমিন প্যানেল</h1>

        {!isFirebaseConfigured && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-300 sm:p-5">
            <strong>ডেমো মোড:</strong> Firebase এখনো যুক্ত হয়নি, তাই লগইন ও খবর সংরক্ষণ বন্ধ আছে।
            Firebase প্রজেক্ট বানিয়ে Vercel-এ <code>VITE_FIREBASE_*</code> ভেরিয়েবল বসালে অ্যাডমিন চালু হবে।
            বিস্তারিত README-তে আছে।
          </div>
        )}

        {isFirebaseConfigured && !user && (
          <form onSubmit={onLogin} className="mx-auto mt-6 w-full max-w-md rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">অ্যাডমিন লগইন</h2>
            <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="admin-email">ইমেইল</label>
            <input id="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} mt-1`} placeholder="admin@example.com" autoComplete="email" />
            <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="admin-pass">পাসওয়ার্ড</label>
            <input id="admin-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} mt-1`} placeholder="••••••••" autoComplete="current-password" />
            {loginError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{loginError}</p>}
            <button type="submit" className="mt-5 h-12 w-full rounded-lg bg-[#0B2A4A] text-base font-bold text-white hover:bg-[#0E7490]">লগইন করুন</button>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">প্রথম অ্যাডমিন অ্যাকাউন্ট Firebase Console → Authentication → Users থেকে বানাতে হবে।</p>
          </form>
        )}

        {isFirebaseConfigured && user && (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
              <p className="min-w-0 break-all text-sm text-slate-700">লগইন: <strong>{user.email}</strong></p>
              <button type="button" onClick={() => signOut(auth)} className="h-11 shrink-0 rounded-lg bg-red-50 px-4 text-sm font-bold text-red-700 ring-1 ring-red-200">লগআউট</button>
            </div>

            {msg && <p className="mt-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-900 ring-1 ring-teal-200">{msg}</p>}

            {/* Article form */}
            <form onSubmit={onSave} className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'খবর সম্পাদনা' : 'নতুন খবর যোগ করুন'}</h2>
              <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="f-title">শিরোনাম *</label>
              <input id="f-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={`${inputCls} mt-1`} placeholder="খবরের শিরোনাম লিখুন" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="f-cat">ক্যাটাগরি</label>
                  <select id="f-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`${inputCls} mt-1`}>
                    {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="f-img">ছবি আপলোড (ImgBB)</label>
                  <input id="f-img" type="file" accept="image/*" onChange={(e) => onUpload(e.target.files?.[0])} className="mt-1 block h-12 w-full min-w-0 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#0B2A4A] file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white" />
                  {uploading && <p className="mt-1 text-xs text-slate-500">আপলোড হচ্ছে…</p>}
                </div>
              </div>
              <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="f-url">অথবা ছবির URL</label>
              <input id="f-url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={`${inputCls} mt-1`} placeholder="https://…" inputMode="url" />
              <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="f-summary">সংক্ষেপ</label>
              <textarea id="f-summary" rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#0E7490]" placeholder="খবরের সংক্ষিপ্ত বিবরণ" />
              <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="f-body">পুরো খবর (প্রতি অনুচ্ছেদ নতুন লাইনে)</label>
              <textarea id="f-body" rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#0E7490]" placeholder="খবরের পুরো লেখা…" />
              <div className="mt-4 flex flex-wrap gap-4">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.breaking} onChange={(e) => setForm({ ...form, breaking: e.target.checked })} className="h-5 w-5 accent-[#DC2626]" /> ব্রেকিং নিউজ (টিকারে দেখাবে)
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-5 w-5 accent-[#0E7490]" /> প্রকাশিত
                </label>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="submit" className="h-12 rounded-lg bg-[#0B2A4A] px-6 text-base font-bold text-white hover:bg-[#0E7490]">{editing ? 'আপডেট করুন' : 'খবর প্রকাশ করুন'}</button>
                {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY) }} className="h-12 rounded-lg bg-slate-100 px-6 text-base font-bold text-slate-700">বাতিল</button>}
              </div>
            </form>

            {/* Category management */}
            <form onSubmit={onAddCategory} className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">ক্যাটাগরি পরিচালনা</h2>
              <p className="mt-1 text-sm text-slate-600">বর্তমান ক্যাটাগরি: {CATEGORIES.map((c) => c.name).join(', ')}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} className={inputCls} placeholder="ক্যাটাগরির নাম (যেমন: স্বাস্থ্য)" aria-label="ক্যাটাগরির নাম" />
                <input value={newCat.slug} onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })} className={inputCls} placeholder="স্লাগ (যেমন: swasthya)" aria-label="ক্যাটাগরির স্লাগ" />
                <button type="submit" className="h-12 rounded-lg bg-[#0E7490] text-base font-bold text-white">ক্যাটাগরি যোগ করুন</button>
              </div>
              {catMsg && <p className="mt-3 text-sm text-slate-700">{catMsg}</p>}
            </form>

            {/* Article list */}
            <section className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">সব খবর ({articles.length}টি)</h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {articles.map((a) => (
                  <li key={a.id || a.slug} className="flex flex-wrap items-center gap-2 py-3">
                    <span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">{a.title}</span>
                    {a.isSample && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">নমুনা</span>}
                    {a.breaking && <span className="rounded bg-[#DC2626] px-2 py-0.5 text-[11px] font-bold text-white">ব্রেকিং</span>}
                    {!a.published && <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">অপ্রকাশিত</span>}
                    <button type="button" onClick={() => onEdit(a)} className="h-10 rounded-lg bg-[#0B2A4A] px-3 text-sm font-bold text-white">সম্পাদনা</button>
                    <button type="button" onClick={() => onDelete(a)} className="h-10 rounded-lg bg-red-50 px-3 text-sm font-bold text-red-700 ring-1 ring-red-200">মুছুন</button>
                  </li>
                ))}
                {articles.length === 0 && <li className="py-4 text-sm text-slate-500">এখনো কোনো খবর নেই।</li>}
              </ul>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
