import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'
import { SAMPLE_ARTICLES } from '../data/sampleArticles'

const BN_DIGITS = { 0: '০', 1: '১', 2: '২', 3: '৩', 4: '৪', 5: '৫', 6: '৬', 7: '৭', 8: '৮', 9: '৯' }
export function toBnNum(n) {
  return String(n).replace(/[0-9]/g, (d) => BN_DIGITS[d])
}

export function formatBnDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' }) +
      ' • ' + d.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Dhaka' })
  } catch {
    return ''
  }
}

function normalize(a) {
  return {
    ...a,
    body: Array.isArray(a.body) ? a.body : (a.body ? String(a.body).split('\n').filter(Boolean) : []),
    breaking: Boolean(a.breaking),
    published: a.published !== false,
    isSample: Boolean(a.isSample),
  }
}

let cache = null
export async function getArticles() {
  if (!isFirebaseConfigured) {
    return [...SAMPLE_ARTICLES].map(normalize).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  if (cache) return cache
  const q = query(collection(db, 'articles'), where('published', '==', true), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  cache = snap.docs.map((d) => normalize({ id: d.id, ...d.data() }))
  return cache
}

export async function getAllArticlesAdmin() {
  if (!isFirebaseConfigured) return [...SAMPLE_ARTICLES].map(normalize)
  const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => normalize({ id: d.id, ...d.data() }))
}

export async function getArticleBySlug(slug) {
  const all = await getArticles()
  return all.find((a) => a.slug === slug) || null
}

export function searchArticles(articles, q) {
  const needle = q.trim().toLowerCase()
  if (!needle) return []
  return articles.filter((a) =>
    (a.title + ' ' + a.summary + ' ' + a.body.join(' ')).toLowerCase().includes(needle))
}

export function relatedArticles(articles, current, n = 4) {
  return articles
    .filter((a) => a.slug !== current.slug && a.category === current.category)
    .concat(articles.filter((a) => a.slug !== current.slug && a.category !== current.category))
    .slice(0, n)
}

export function slugify(title) {
  const base = String(title).trim().toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '')
  return base || 'khabar-' + Date.now()
}

export async function saveArticle(article) {
  if (!isFirebaseConfigured) throw new Error('Firebase সেট করা হয়নি — ডেমো মোডে খবর সংরক্ষণ করা যায় না।')
  const id = article.id || article.slug
  await setDoc(doc(db, 'articles', id), { ...article, updatedAt: new Date().toISOString() }, { merge: true })
  cache = null
}

export async function removeArticle(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase সেট করা হয়নি।')
  await deleteDoc(doc(db, 'articles', id))
  cache = null
}

export async function getCategories() {
  if (!isFirebaseConfigured) return null
  const snap = await getDocs(collection(db, 'categories'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function saveCategory(cat) {
  if (!isFirebaseConfigured) throw new Error('Firebase সেট করা হয়নি।')
  await setDoc(doc(db, 'categories', cat.slug), { name: cat.name, slug: cat.slug }, { merge: true })
}
