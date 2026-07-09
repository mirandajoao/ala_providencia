import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const VAZIO = {
  nome_familia: '', endereco: '', bairro: '', cidade: 'Belém',
  telefone_contato: '', necessidades: '', acompanhamento_prioritario: false, chefe_membro_id: '',
}

export default function FamiliaForm() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { usuario } = useAuth()
  const [dados, setDados] = useState(VAZIO)
  const [membrosFamilia, setMembrosFamilia] = useState([])
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const podeEditar = ['admin', 'bispado', 'secretario'].includes(usuario?.perfil)

  useEffect(() => {
    if (!id) return
    supabase.from('familias').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setDados({ ...VAZIO, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ''])) })
    })
    supabase.from('membros').select('id, nome_completo').eq('familia_id', id).eq('arquivado', false)
      .order('nome_completo').then(({ data }) => setMembrosFamilia(data || []))
  }, [id])

  function mudar(campo, valor) {
    setDados((d) => ({ ...d, [campo]: valor }))
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    const payload = { ...dados }
    delete payload.id; delete payload.criado_em; delete payload.atualizado_em; delete payload.arquivado
    if (payload.chefe_membro_id === '') payload.chefe_membro_id = null
    const q = id
      ? supabase.from('familias').update(payload).eq('id', id)
      : supabase.from('familias').insert(payload)
    const { error } = await q
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. ' + error.message); return }
    navegar('/familias')
  }

  return (
    <>
      <h1>{id ? 'Editar família' : 'Nova família'}</h1>
      {erro && <div className="aviso-erro">{erro}</div>}
      <form onSubmit={salvar} className="cartao" style={{ marginTop: '1rem' }}>
        <fieldset disabled={!podeEditar} style={{ border: 'none' }}>
          <div className="campo">
            <label>Nome da família (ex.: Família Silva Santos)</label>
            <input value={dados.nome_familia} onChange={(e) => mudar('nome_familia', e.target.value)} required />
          </div>
          <div className="linha-campos">
            <div className="campo">
              <label>Endereço</label>
              <input value={dados.endereco || ''} onChange={(e) => mudar('endereco', e.target.value)} />
            </div>
            <div className="campo">
              <label>Bairro</label>
              <input value={dados.bairro || ''} onChange={(e) => mudar('bairro', e.target.value)} />
            </div>
            <div className="campo">
              <label>Telefone de contato</label>
              <input value={dados.telefone_contato || ''} onChange={(e) => mudar('telefone_contato', e.target.value)} />
            </div>
          </div>
          {id && (
            <div className="campo">
              <label>Chefe da família</label>
              <select value={dados.chefe_membro_id || ''} onChange={(e) => mudar('chefe_membro_id', e.target.value)}>
                <option value="">— Definir depois —</option>
                {membrosFamilia.map((m) => <option key={m.id} value={m.id}>{m.nome_completo}</option>)}
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--texto-suave)', marginTop: '0.3rem' }}>
                A lista mostra os membros já vinculados a esta família (vincule-os no cadastro de cada membro).
              </p>
            </div>
          )}
          <div className="campo">
            <label>Necessidades e pontos de apoio (visível ao conselho)</label>
            <textarea rows="3" value={dados.necessidades || ''} onChange={(e) => mudar('necessidades', e.target.value)} />
          </div>
          <div className="campo">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={!!dados.acompanhamento_prioritario}
                onChange={(e) => mudar('acompanhamento_prioritario', e.target.checked)} />
              Família em acompanhamento prioritário
            </label>
          </div>
          <div className="barra-acoes">
            <button type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
            <button type="button" className="secundario" onClick={() => navegar('/familias')}>Cancelar</button>
          </div>
        </fieldset>
      </form>
      {id && membrosFamilia.length > 0 && (
        <section className="cartao" style={{ marginTop: '1rem' }}>
          <h2>Membros desta família</h2>
          <ul style={{ listStyle: 'none', marginTop: '0.5rem' }}>
            {membrosFamilia.map((m) => (
              <li key={m.id} style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--borda)', fontSize: '0.88rem' }}>
                <a href={`/membros/${m.id}`}>{m.nome_completo}</a>
                {dados.chefe_membro_id === m.id && <span className="etiqueta neutro" style={{ marginLeft: '0.5rem' }}>Chefe da família</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
