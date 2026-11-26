import Header from '../components/Header'
import Footer from '../components/Footer'

export default function LiveTvPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-4">
        <h1 className="border-b-2 border-[#0B2A4A] pb-3 text-2xl font-extrabold text-[#0B2A4A] sm:text-3xl">লাইভ টিভি</h1>
        <div className="mt-6 overflow-hidden rounded-xl bg-[#0B2A4A] text-white shadow-sm">
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center sm:min-h-80 sm:p-10">
            <svg className="h-14 w-14 text-teal-300" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <rect width="64" height="64" rx="12" fill="rgba(255,255,255,.08)" />
              <path d="M26 22l18 10-18 10V22z" fill="#fff" />
            </svg>
            <p className="text-xl font-extrabold sm:text-2xl">লাইভ স্ট্রিম শীঘ্রই আসছে</p>
            <p className="max-w-md text-sm leading-relaxed text-teal-100 sm:text-base">
              আসল লাইভ স্ট্রিমের লিংক যুক্ত হলে এখানেই সরাসরি সম্প্রচার দেখা যাবে।
              এখনো কোনো লাইভ চলছে না — এখানে ভুয়া লাইভ দেখানো হয় না।
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-white p-4 text-sm leading-relaxed text-slate-600 ring-1 ring-slate-200">
          লাইভ স্ট্রিমের লিংক (যেমন YouTube Live / Facebook Live / সরাসরি স্ট্রিম URL) পাওয়া গেলে
          অ্যাডমিন প্যানেল থেকে তা যুক্ত করা যাবে। ততক্ষণ এই পাতাটি এভাবেই থাকবে।
        </p>
      </main>
      <Footer />
    </div>
  )
}
