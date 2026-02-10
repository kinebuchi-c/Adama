import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, CountryDetail, SchedulePage } from './pages'
import { LarkCallbackPage } from './pages/LarkCallbackPage'
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
import { Shibuya5FPage } from './features/shibuya5f'

const basename = import.meta.env.BASE_URL

function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* World Territory Vision Route */}
        <Route path="/territory" element={<TerritoryPage />} />

        {/* Shibuya 5F Schedule Route */}
        <Route path="/shibuya5f" element={<Shibuya5FPage />} />

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

        {/* Customer Cloud International Project Dashboard Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/country/:countryCode" element={<CountryDetail />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/auth/lark/callback" element={<LarkCallbackPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
