# শীতলক্ষ্যা টিভি — Shitalakhya TV

বাংলা প্রথম নিউজ ওয়েবসাইট। Jamuna TV-র মতো লেআউট (হেডার, ব্রেকিং টিকার, প্রধান খবর, ক্যাটাগরি সেকশন) — কিন্তু ব্র্যান্ডিং, লোগো, লেখা ও ছবি সম্পূর্ণ নিজের। কোনো সাইটের খবর/ছবি/লোগো কপি করা হয়নি।

## স্ট্যাক
- React 19 + Vite + Tailwind CSS v4
- Firebase: Firestore (খবর/ক্যাটাগরি) + Auth (অ্যাডমিন লগইন)
- হোস্টিং: Vercel

## রুট
- `/` হোমপেজ — ব্রেকিং টিকার, প্রধান খবর, সর্বশেষ, ৯ ক্যাটাগরি সেকশন
- `/khabar/:slug` খবরের বিস্তারিত + সম্পর্কিত খবর
- `/category/:slug` ক্যাটাগরি পেজ
- `/search?q=...` খবর খোঁজা
- `/live-tv` লাইভ টিভি — এখন শুধু জায়গা; আসল স্ট্রিম লিংক যুক্ত হলে এখানে দেখাবে (ভুয়া লাইভ নেই)
- `/admin` অ্যাডমিন প্যানেল — খবর যোগ/সম্পাদনা/মোছা, ব্রেকিং টিক, ক্যাটাগরি, ImgBB ছবি আপলোড

## নমুনা খবর
Firebase না থাকলে সাইট ডেমো মোডে চলে — ১২টি নিজের লেখা নমুনা খবর দেখায়, প্রতিটায় **"নমুনা"** ব্যাজ থাকে। আসল খবর অ্যাডমিন প্যানেল থেকে যোগ করতে হবে।

## চালানো
```bash
npm run dev      # লোকালে
npm run build    # প্রোডাকশন বিল্ড
```

## Firebase সেটআপ
1. Firebase Console-এ নতুন প্রজেক্ট বানান → Firestore (এশিয়া-দক্ষিণ/সিঙ্গাপুর) + Authentication → Email/Password চালু করুন।
2. `firestore.rules` কপি করে Firestore Rules-এ Publish করুন।
3. Web app বানিয়ে config-এর মানগুলো Vercel-এ Environment Variables হিসেবে বসান (লোকালে `.env` ফাইলে):
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
     `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
4. প্রথম অ্যাডমিন: Firebase Console → Authentication → Users → Add user (ইমেইল + পাসওয়ার্ড)। তারপর `/admin`-এ লগইন করুন। প্রথম লগইনের পর পাসওয়ার্ড বদলে নিন।

## ImgBB ছবি আপলোড
চাবি কোডে/রেপোতে **নেই** — শুধু Vercel-এ `IMGBB_API_KEY` Environment Variable হিসেবে বসাতে হবে। `api/upload-image.js` সার্ভার-সাইডে চাবি ব্যবহার করে ImgBB-তে ছবি পাঠায়। চাবি না থাকলে অ্যাডমিনে ছবির URL বসিয়ে দেওয়া যায়।

## রেসপন্সিভ
মোবাইল 320px থেকে ডেস্কটপ পর্যন্ত: মোবাইলে হ্যামবার্গার মেনু, কার্ড ১ কলাম → ট্যাবলেটে ২ → ডেস্কটপে ৩/৪ কলাম; কোনো ভিউতে পাশে স্ক্রল হয় না।
