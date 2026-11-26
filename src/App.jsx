import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ArticlePage from './pages/ArticlePage'
import CategoryPage from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'
import LiveTvPage from './pages/LiveTvPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/khabar/:slug" element={<ArticlePage />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/live-tv" element={<LiveTvPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
