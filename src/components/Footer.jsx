import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'

export default function Footer() {
  return (
    <footer className="mt-10 bg-[#071E36] text-slate-300">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0">
          <p className="text-xl font-extrabold text-white">শীতলক্ষ্যা <span className="rounded bg-[#DC2626] px-1.5 py-px text-sm">TV</span></p>
          <p className="mt-3 text-sm leading-relaxed">
            শীতলক্ষ্যা টিভি — জাতীয়, রাজনীতি, খেলা, বিনোদন, আন্তর্জাতিক, অর্থনীতি, শিক্ষা, ধর্ম ও প্রযুক্তির খবর বাংলায়।
            সাইটের সব খবর "নমুনা" লেবেল ছাড়া প্রকাশিত হলে তা অ্যাডমিন প্যানেল থেকে যুক্ত আসল খবর।
          </p>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white">ক্যাটাগরি</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link to={`/category/${c.slug}`} className="hover:text-white hover:underline">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white">যোগাযোগ</p>
          <p className="mt-3 text-sm leading-relaxed">
            লাইভ স্ট্রিম, বিজ্ঞাপন বা খবরের তথ্য পাঠাতে অ্যাডমিন প্যানেলের মাধ্যমে যোগাযোগ করুন।
            যোগাযোগের ইমেইল/ফোন এখনো যুক্ত হয়নি — শীঘ্রই যুক্ত হচ্ছে।
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/live-tv" className="rounded-lg bg-[#DC2626] px-3 py-2 text-sm font-bold text-white">লাইভ টিভি</Link>
            <Link to="/admin" className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white">অ্যাডমিন প্যানেল</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-7xl px-4 py-4 text-center text-xs sm:text-sm">
          © {new Date().getFullYear()} শীতলক্ষ্যা টিভি — সর্বস্বত্ব সংরক্ষিত। এই সাইটের নমুনা খবরগুলো আসল খবর নয়।
        </p>
      </div>
    </footer>
  )
}
