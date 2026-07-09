import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Membros from './pages/Membros'
import MembroForm from './pages/MembroForm'
import Familias from './pages/Familias'
import FamiliaForm from './pages/FamiliaForm'

function Protegido({ children }) {
  const { sessao, carregando } = useAuth()
  if (carregando) return <p className="vazio">Carregando…</p>
  if (!sessao) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protegido><Layout /></Protegido>}>
        <Route index element={<Dashboard />} />
        <Route path="membros" element={<Membros />} />
        <Route path="membros/novo" element={<MembroForm />} />
        <Route path="membros/:id" element={<MembroForm />} />
        <Route path="familias" element={<Familias />} />
        <Route path="familias/nova" element={<FamiliaForm />} />
        <Route path="familias/:id" element={<FamiliaForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
