import { Link } from 'react-router-dom'

export default function Ticker({ articles }) {
  const breaking = articles.filter((a) => a.breaking)
  if (!breaking.length) return null
  // Duplicate list for a seamless marquee loop.
  const items = [...breaking, ...breaking]
  return (
    <div className="border-b border-red-200 bg-red-50">
      <div className="mx-auto flex w-full max-w-7xl items-stretch gap-0 px-0 sm:px-4">
        <span className="flex shrink-0 items-center bg-[#DC2626] px-3 py-2 text-xs font-extrabold text-white sm:px-4 sm:text-sm">
          ব্রেকিং
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="ticker-track items-center py-2">
            {items.map((a, i) => (
              <Link
                key={`${a.slug}-${i}`}
                to={`/khabar/${a.slug}`}
                className="mx-4 inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-red-900 hover:underline"
                aria-hidden={i >= breaking.length}
                tabIndex={i >= breaking.length ? -1 : 0}
              >
                <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
