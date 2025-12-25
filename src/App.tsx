import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, CountryDetail, SchedulePage } from './pages'
import { SuginamiLayout } from './features/suginami/components/SuginamiLayout'
import {
  TopPage,
  OnboardingPage,
  TaskListPage,
  DocumentsPage,
  OfficeNavPage,
  LifeSupportPage,
  PhrasesPage,
  InfoHubPage,
  HelpPage,
} from './features/suginami/pages'
import { TerritoryPage } from './features/territory'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* World Territory Vision Route */}
        <Route path="/territory" element={<TerritoryPage />} />

        {/* Suginami New Resident Support Routes */}
        <Route path="/suginami" element={<SuginamiLayout />}>
          <Route index element={<TopPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="tasks" element={<TaskListPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="offices" element={<OfficeNavPage />} />
          <Route path="life" element={<LifeSupportPage />} />
          <Route path="phrases" element={<PhrasesPage />} />
          <Route path="info" element={<InfoHubPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>

        {/* Original Baobab World Map Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/country/:countryCode" element={<CountryDetail />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
