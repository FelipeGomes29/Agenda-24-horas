import { Navigate, Route, Routes } from 'react-router-dom'
import DayPage from '../pages/DayPage.jsx'
import PlannerLayout from '../pages/PlannerLayout.jsx'
import WeekPage from '../pages/WeekPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PlannerLayout />}>
        <Route index element={<Navigate to="/semana" replace />} />
        <Route path="semana" element={<WeekPage />} />
        <Route path="dia" element={<DayPage />} />
        <Route path="*" element={<Navigate to="/semana" replace />} />
      </Route>
    </Routes>
  )
}
