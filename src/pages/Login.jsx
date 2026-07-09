import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setEnviando(false)
    if (error) {
      setErro('Não foi possível entrar. Verifique o e-mail e a senha.')
      return
    }
    navegar('/')
  }

  return (
    <div className="login-fundo">
      <div className="login-caixa">
        <div className="selo">
          <h1>Ala Providência</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
            Sistema do conselho da ala
          </p>
          <div className="filete" />
        </div>
        {erro && <div className="aviso-erro">{erro}</div>}
        <form onSubmit={entrar}>
          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          </div>
          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="current-password" />
          </div>
          <button type="submit" disabled={enviando} style={{ width: '100%' }}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
