// Vercel Serverless Function: ImgBB-তে ছবি আপলোড।
// চাবি শুধু process.env.IMGBB_API_KEY থেকে নেওয়া হয় — কোডে/রেপোতে কোনো চাবি নেই।
// Vercel Dashboard → Project → Settings → Environment Variables-এ IMGBB_API_KEY বসাতে হবে।
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'শুধু POST অনুরোধ গ্রহণযোগ্য।' })
  }
  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'সার্ভারে ImgBB চাবি বসানো হয়নি। Vercel-এ IMGBB_API_KEY সেট করুন।' })
  }
  try {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const raw = Buffer.concat(chunks)
    const contentType = req.headers['content-type'] || ''
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)
    if (!boundaryMatch) {
      return res.status(400).json({ error: 'ছবির ফাইল পাওয়া যায়নি।' })
    }
    const boundary = '--' + (boundaryMatch[1] || boundaryMatch[2]).trim()
    const parts = raw.toString('latin1').split(boundary)
    let imageBase64 = null
    for (const part of parts) {
      if (!part.includes('Content-Type: image') && !part.includes('filename=')) continue
      const headerEnd = part.indexOf('\r\n\r\n')
      if (headerEnd === -1) continue
      const data = part.slice(headerEnd + 4)
      const clean = data.replace(/\r\n--$/, '').replace(/\r\n$/, '')
      imageBase64 = Buffer.from(clean, 'latin1').toString('base64')
      break
    }
    if (!imageBase64) {
      return res.status(400).json({ error: 'ছবির ফাইল পাওয়া যায়নি।' })
    }
    const form = new URLSearchParams()
    form.append('key', apiKey)
    form.append('image', imageBase64)
    const up = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form })
    const result = await up.json()
    if (!up.ok || !result?.data?.url) {
      return res.status(502).json({ error: 'ImgBB-তে আপলোড হয়নি। পরে আবার চেষ্টা করুন।' })
    }
    return res.status(200).json({ url: result.data.url })
  } catch (err) {
    return res.status(500).json({ error: 'আপলোডে সমস্যা হয়েছে: ' + (err?.message || 'অজানা ত্রুটি') })
  }
}
