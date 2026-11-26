export const CATEGORIES = [
  { slug: 'jatiyo', name: 'জাতীয়', initial: 'জা', gradient: 'from-[#0B2A4A] to-[#0E7490]' },
  { slug: 'rajniti', name: 'রাজনীতি', initial: 'রা', gradient: 'from-[#7C2D12] to-[#DC2626]' },
  { slug: 'khela', name: 'খেলা', initial: 'খে', gradient: 'from-[#14532D] to-[#16A34A]' },
  { slug: 'binodon', name: 'বিনোদন', initial: 'বি', gradient: 'from-[#4C1D95] to-[#DB2777]' },
  { slug: 'antorjatik', name: 'আন্তর্জাতিক', initial: 'আ', gradient: 'from-[#1E3A8A] to-[#2563EB]' },
  { slug: 'orthoniti', name: 'অর্থনীতি', initial: 'অ', gradient: 'from-[#78350F] to-[#D97706]' },
  { slug: 'shikkha', name: 'শিক্ষা', initial: 'শি', gradient: 'from-[#134E4A] to-[#0D9488]' },
  { slug: 'dhormo', name: 'ধর্ম', initial: 'ধ', gradient: 'from-[#3B0764] to-[#7E22CE]' },
  { slug: 'projukti', name: 'প্রযুক্তি', initial: 'প্র', gradient: 'from-[#0F172A] to-[#475569]' },
]

export function categoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || { slug, name: slug, initial: 'খ', gradient: 'from-[#0B2A4A] to-[#0E7490]' }
}
