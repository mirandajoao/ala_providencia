import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROTULO_PERFIL = {
  admin: 'Administrador',
  bispado: 'Bispado',
  secretario: 'Secretário',
  presidencia: 'Presidência',
}

export default function Layout() {
  const { usuario, sair } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="marca">
          Conselho da Ala Providência
          <small>Estaca Cidade Nova · A Igreja de Jesus Cristo dos Santos dos Últimos Dias</small>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {usuario && (
            <span style={{ fontSize: '0.78rem', color: '#b9c4d4' }}>
              {usuario.nome_exibicao} · {ROTULO_PERFIL[usuario.perfil]}
              {usuario.organizacoes?.nome ? ` · ${usuario.organizacoes.nome}` : ''}
            </span>
          )}
          <button onClick={sair}>Sair</button>
        </div>
      </header>
      <nav className="navbar">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'ativo' : '')}>Início</NavLink>
        <NavLink to="/membros" className={({ isActive }) => (isActive ? 'ativo' : '')}>Membros</NavLink>
        <NavLink to="/familias" className={({ isActive }) => (isActive ? 'ativo' : '')}>Famílias</NavLink>
      </nav>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  )
}
