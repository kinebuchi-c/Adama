import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Layout'
import { Home, CountryDetail } from './pages'

function App() {
  return (
    <BrowserRouter>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
      }}>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/country/:countryCode" element={<CountryDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
