import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Familias() {
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const [familias, setFamilias] = useState([])
  const [busca, setBusca] = useState('')
  const [soPrioritarias, setSoPrioritarias] = useState(false)
  const [carregando, setCarregando] = useState(true)

  const podeEditar = ['admin', 'bispado', 'secretario'].includes(usuario?.perfil)

  useEffect(() => {
    supabase
      .from('familias')
      .select('id, nome_familia, bairro, acompanhamento_prioritario, chefe:chefe_membro_id(nome_completo), membros(id)')
      .eq('arquivado', false)
      .order('nome_familia')
      .then(({ data }) => {
        setFamilias(data || [])
        setCarregando(false)
      })
  }, [])

  const filtradas = familias.filter((f) =>
    (!busca || f.nome_familia.toLowerCase().includes(busca.toLowerCase())) &&
    (!soPrioritarias || f.acompanhamento_prioritario)
  )

  return (
    <>
      <h1>Famílias</h1>
      <div className="barra-acoes">
        <input type="search" placeholder="Buscar família…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontSize: '0.85rem' }}>
          <input type="checkbox" style={{ width: 'auto' }} checked={soPrioritarias} onChange={(e) => setSoPrioritarias(e.target.checked)} />
          Apenas acompanhamento prioritário
        </label>
        <span style={{ flex: 1 }} />
        {podeEditar && <button onClick={() => navegar('/familias/nova')}>Nova família</button>}
      </div>

      {carregando ? (
        <p className="vazio">Carregando famílias…</p>
      ) : filtradas.length === 0 ? (
        <div className="cartao vazio">Nenhuma família encontrada.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Família</th>
              <th className="ocultavel">Chefe da família</th>
              <th className="ocultavel">Bairro</th>
              <th>Membros</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((f) => (
              <tr key={f.id}>
                <td><Link to={`/familias/${f.id}`}>{f.nome_familia}</Link></td>
                <td className="ocultavel">{f.chefe?.nome_completo || '—'}</td>
                <td className="ocultavel">{f.bairro || '—'}</td>
                <td>{f.membros?.length ?? 0}</td>
                <td>
                  {f.acompanhamento_prioritario
                    ? <span className="etiqueta alerta">Prioritária</span>
                    : <span className="etiqueta neutro">Regular</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
