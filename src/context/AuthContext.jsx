import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null)
  const [usuario, setUsuario] = useState(null) // linha da tabela usuarios (perfil, organizacao)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      if (!data.session) setCarregando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, s) => setSessao(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!sessao) { setUsuario(null); return }
    supabase
      .from('usuarios')
      .select('id, nome_exibicao, perfil, organizacao_id, organizacoes(nome)')
      .eq('auth_user_id', sessao.user.id)
      .single()
      .then(({ data }) => {
        setUsuario(data)
        setCarregando(false)
      })
  }, [sessao])

  const sair = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ sessao, usuario, carregando, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
