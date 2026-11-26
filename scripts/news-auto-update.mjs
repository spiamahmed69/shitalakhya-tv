// শীতলক্ষ্যা টিভি — অটো নিউজ আপডেটার
// প্রতি ঘণ্টায় GitHub Actions থেকে চলে। RSS ফিড থেকে নতুন খবর নিয়ে
// Gemini (ফ্রি টিয়ার) দিয়ে নিজের ভাষায় নতুন করে লিখে Firestore-এ সরাসরি প্রকাশ করে।
// নিয়ম: প্রতিটি খবরে আলাদা API call; মিনিটে সর্বোচ্চ ১০ call;
// 429 (রেট লিমিট) এলে অপেক্ষা করে আবার চেষ্টা; লেখার দৈর্ঘ্য সীমিত।
// কোনো খবর হুবহু কপি করা হয় না; প্রতিটি খবরে মূল সূত্রের নাম ও লিংক থাকে।
// চালাতে env লাগে: GEMINI_API_KEY, FIREBASE_SERVICE_ACCOUNT (JSON string)

import admin from 'firebase-admin'
import crypto from 'node:crypto'

const FEEDS = [
  { name: 'প্রথম আলো', url: 'https://www.prothomalo.com/feed/' },
  { name: 'বিবিসি বাংলা', url: 'https://feeds.bbci.co.uk/bengali/rss.xml' },
  { name: 'বাংলা ট্রিবিউন', url: 'https://www.banglatribune.com/feed/' },
]

const CATEGORIES = ['jatiyo', 'rajniti', 'khela', 'binodon', 'antorjatik', 'orthoniti', 'shikkha', 'dhormo', 'projukti']

// শুধু গত ৩ ঘণ্টার খবর নেওয়া হবে — প্রথমবার চালালে পুরোনো খবরে সাইট ভরে যাবে না।
const MAX_AGE_MS = 3 * 60 * 60 * 1000
const UA = { 'User-Agent': 'ShitalakhyaTV-AutoNews/1.0 (+https://shitalakhya-tv.vercel.app)' }

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex')
}

function stripTags(html) {
  return (html || '')
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function pickTag(block, names) {
  for (const name of names) {
    const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))
    if (m) return stripTags(m[1])
  }
  return ''
}

function parseRss(xml) {
  const items = []
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const block = m[1]
    const title = pickTag(block, ['title'])
    const link = pickTag(block, ['link'])
    const pubDate = pickTag(block, ['pubDate', 'dc:date'])
    const desc = pickTag(block, ['content:encoded', 'description'])
    const category = pickTag(block, ['category'])
    if (title && link) items.push({ title, link, pubDate, desc, category })
  }
  return items
}

function slugify(title, link) {
  const base = String(title).toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'khabar'
  return `${base}-${sha256(link).slice(0, 6)}`
}

// প্রতিটি খবরের জন্য আলাদা একটা API call — এক call-এ একাধিক খবর পাঠানো হয় না।
// মিনিটে সর্বোচ্চ ১০টা call (call-এর মাঝে কমপক্ষে ৬ সেকেন্ড বিরতি)।
const MIN_CALL_GAP_MS = 6000
let lastCallStart = 0

// Gemini ফ্রি টিয়ার মডেল (Flash-Lite-এ দিনে প্রায় ৫০০টা ফ্রি call)।
const GEMINI_MODEL = 'gemini-3.5-flash-lite'

async function rewriteWithGemini(item, sourceName) {
  // 429 (রেট লিমিট) এলে অপেক্ষা করে আবার চেষ্টা করা হবে।
  const retryWaits = [30000, 60000]
  const prompt = `তুমি একজন বাংলা সংবাদ লেখক। নিচের খবরের তথ্য থেকে নিজের ভাষায় সম্পূর্ণ নতুন করে বাংলা খবর লিখবে। মূল খবরের বাক্য হুবহু কপি করবে না। নাম, সংখ্যা, তারিখ ও তথ্য ঠিক রাখবে; কোনো তথ্য বানাবে না। শুধু JSON দেবে।\n\nউৎস: ${sourceName}\nমূল শিরোনাম: ${item.title}\nমূল লিংক: ${item.link}\nবিবরণ: ${item.desc.slice(0, 3000)}\n\nএই JSON আকারে লেখো: {"title": "সংক্ষিপ্ত শিরোনাম", "summary": "১-২ বাক্যের সংক্ষেপ", "body": ["অনুচ্ছেদ ১", "অনুচ্ছেদ ২", "অনুচ্ছেদ ৩"], "category": "এই ৯টির একটি: jatiyo, rajniti, khela, binodon, antorjatik, orthoniti, shikkha, dhormo, projukti", "breaking": true/false (শুধু খুব গুরুত্বপূর্ণ জরুরি খবর হলে true)}। body-তে ৩-৪টি ছোট অনুচ্ছেদ থাকবে।`
  for (let attempt = 0; ; attempt++) {
    const gap = Date.now() - lastCallStart
    if (gap < MIN_CALL_GAP_MS) await sleep(MIN_CALL_GAP_MS - gap)
    lastCallStart = Date.now()
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200,
          responseMimeType: 'application/json',
        },
      }),
    })
    if (res.status === 429 && attempt < retryWaits.length) {
      const wait = retryWaits[attempt]
      console.log(`  রেট লিমিট (429) — ${wait / 1000} সেকেন্ড অপেক্ষা করে আবার চেষ্টা করছি`)
      await sleep(wait)
      continue
    }
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
    if (!text) throw new Error('Gemini থেকে খালি উত্তর এসেছে')
    const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    const out = JSON.parse(clean)
    if (!out.title || !out.summary || !Array.isArray(out.body) || !out.body.length) {
      throw new Error('Gemini থেকে অসম্পূর্ণ লেখা এসেছে')
    }
    if (!CATEGORIES.includes(out.category)) out.category = 'jatiyo'
    // দৈর্ঘ্য সীমিত রাখা: শিরোনাম ১২০, সংক্ষেপ ২৫০, body সর্বোচ্চ ৪ অনুচ্ছেদ × ৬০০ অক্ষর।
    out.title = String(out.title).slice(0, 120)
    out.summary = String(out.summary).slice(0, 250)
    out.body = out.body.slice(0, 4).map((p) => String(p).slice(0, 600))
    return out
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY env নেই')
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) throw new Error('FIREBASE_SERVICE_ACCOUNT env নেই')
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) })
  const db = admin.firestore()
  const now = Date.now()
  // প্রতি রানে সর্বোচ্চ ১০টা গুরুত্বপূর্ণ খবর — সবচেয়ে নতুন ১০টা,
  // এক সোর্স থেকে সর্বোচ্চ ৪টা (যাতে এক সোর্সেই সব ভরে না যায়)।
  const MAX_PER_RUN = 10
  const MAX_PER_SOURCE = 4
  let published = 0
  let skipped = 0
  const candidates = []

  for (const feed of FEEDS) {
    console.log(`ফিড: ${feed.name} (${feed.url})`)
    let xml
    try {
      const res = await fetch(feed.url, { headers: UA, signal: AbortSignal.timeout(30000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      xml = await res.text()
    } catch (err) {
      console.log(`  ফিড পড়া যায়নি: ${err.message}`)
      continue
    }
    const items = parseRss(xml)
    console.log(`  আইটেম: ${items.length}টি`)
    for (const item of items) {
      const pubMs = item.pubDate ? Date.parse(item.pubDate) : NaN
      if (!Number.isNaN(pubMs) && now - pubMs > MAX_AGE_MS) { skipped++; continue }
      const seenRef = db.collection('autoNewsSeen').doc(sha256(item.link))
      if ((await seenRef.get()).exists) { skipped++; continue }
      candidates.push({ ...item, feed, pubMs: Number.isNaN(pubMs) ? 0 : pubMs })
    }
  }

  // সবচেয়ে নতুন আগে; এক সোর্স থেকে সর্বোচ্চ ৪টা; মোট ১০টা।
  candidates.sort((a, b) => b.pubMs - a.pubMs)
  const perSource = {}
  const selected = []
  for (const c of candidates) {
    if (selected.length >= MAX_PER_RUN) break
    const n = perSource[c.feed.name] || 0
    if (n >= MAX_PER_SOURCE) continue
    perSource[c.feed.name] = n + 1
    selected.push(c)
  }
  skipped += candidates.length - selected.length
  console.log(`বাছাই: ${selected.length}টি (মোট নতুন ${candidates.length}টি থেকে)`)

  for (const item of selected) {
    const feed = item.feed
    try {
      const rw = await rewriteWithGemini(item, feed.name)
      const slug = slugify(rw.title, item.link)
      const body = [...rw.body, `সূত্র: ${feed.name} — ${item.link}`]
      await db.collection('articles').doc(slug).set({
        id: slug,
        slug,
        title: rw.title,
        category: rw.category,
        summary: rw.summary,
        body,
        breaking: Boolean(rw.breaking),
        published: true,
        isSample: false,
        imageUrl: null,
        createdAt: new Date().toISOString(),
        sourcePublishedAt: item.pubDate || null,
        sourceName: feed.name,
        sourceUrl: item.link,
        autoGenerated: true,
      })
      await db.collection('autoNewsSeen').doc(sha256(item.link)).set({ link: item.link, title: rw.title, source: feed.name, publishedAt: new Date().toISOString() })
      published++
      console.log(`  প্রকাশ: ${rw.title}`)
    } catch (err) {
      console.log(`  ব্যর্থ (${item.title.slice(0, 40)}): ${err.message}`)
    }
    await sleep(500)
  }
  console.log(`শেষ: প্রকাশ ${published}টি, বাদ ${skipped}টি`)
}

main().catch((err) => { console.error(err); process.exit(1) })
