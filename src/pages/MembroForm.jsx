import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const VAZIO = {
  nome_completo: '', data_nascimento: '', sexo: '', estado_civil: '',
  telefone: '', email: '', endereco: '', data_batismo: '',
  sacerdocio: 'nenhum', status: 'ativo', familia_id: '', pode_servir_chamado: true,
}

export default function MembroForm() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { usuario } = useAuth()
  const [dados, setDados] = useState(VAZIO)
  const [familias, setFamilias] = useState([])
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const podeEditar = ['admin', 'bispado', 'secretario'].includes(usuario?.perfil)

  useEffect(() => {
    supabase.from('familias').select('id, nome_familia').eq('arquivado', false).order('nome_familia')
      .then(({ data }) => setFamilias(data || []))
    if (id) {
      supabase.from('membros').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setDados({ ...VAZIO, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ''])) })
      })
    }
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
    for (const k of ['data_nascimento', 'data_batismo', 'data_confirmacao', 'sexo', 'estado_civil', 'familia_id', 'email', 'telefone', 'endereco']) {
      if (payload[k] === '') payload[k] = null
    }
    const q = id
      ? supabase.from('membros').update(payload).eq('id', id)
      : supabase.from('membros').insert(payload)
    const { error } = await q
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. ' + error.message); return }
    navegar('/membros')
  }

  async function arquivar() {
    if (!confirm('Arquivar este membro? Ele deixará de aparecer nas listas, mas o histórico é preservado.')) return
    await supabase.from('membros').update({ arquivado: true }).eq('id', id)
    navegar('/membros')
  }

  return (
    <>
      <h1>{id ? 'Editar membro' : 'Novo membro'}</h1>
      {!podeEditar && <div className="aviso-erro">Seu perfil permite apenas visualizar este cadastro.</div>}
      {erro && <div className="aviso-erro">{erro}</div>}
      <form onSubmit={salvar} className="cartao" style={{ marginTop: '1rem' }}>
        <fieldset disabled={!podeEditar} style={{ border: 'none' }}>
          <div className="campo">
            <label>Nome completo</label>
            <input value={dados.nome_completo} onChange={(e) => mudar('nome_completo', e.target.value)} required />
          </div>
          <div className="linha-campos">
            <div className="campo">
              <label>Data de nascimento</label>
              <input type="date" value={dados.data_nascimento || ''} onChange={(e) => mudar('data_nascimento', e.target.value)} />
            </div>
            <div className="campo">
              <label>Sexo</label>
              <select value={dados.sexo || ''} onChange={(e) => mudar('sexo', e.target.value)}>
                <option value="">—</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>
            <div className="campo">
              <label>Estado civil</label>
              <select value={dados.estado_civil || ''} onChange={(e) => mudar('estado_civil', e.target.value)}>
                <option value="">—</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
              </select>
            </div>
          </div>
          <div className="linha-campos">
            <div className="campo">
              <label>Telefone</label>
              <input value={dados.telefone || ''} onChange={(e) => mudar('telefone', e.target.value)} />
            </div>
            <div className="campo">
              <label>E-mail</label>
              <input type="email" value={dados.email || ''} onChange={(e) => mudar('email', e.target.value)} />
            </div>
          </div>
          <div className="campo">
            <label>Endereço</label>
            <input value={dados.endereco || ''} onChange={(e) => mudar('endereco', e.target.value)} />
          </div>
          <div className="linha-campos">
            <div className="campo">
              <label>Data do batismo</label>
              <input type="date" value={dados.data_batismo || ''} onChange={(e) => mudar('data_batismo', e.target.value)} />
            </div>
            <div className="campo">
              <label>Sacerdócio</label>
              <select value={dados.sacerdocio} onChange={(e) => mudar('sacerdocio', e.target.value)}>
                <option value="nenhum">Nenhum</option>
                <option value="diacono">Diácono</option>
                <option value="mestre">Mestre</option>
                <option value="sacerdote">Sacerdote</option>
                <option value="elder">Élder</option>
                <option value="sumo_sacerdote">Sumo sacerdote</option>
              </select>
            </div>
            <div className="campo">
              <label>Status</label>
              <select value={dados.status} onChange={(e) => mudar('status', e.target.value)}>
                <option value="ativo">Ativo</option>
                <option value="menos_ativo">Menos ativo</option>
                <option value="mudou_se">Mudou-se</option>
                <option value="registro_outra_ala">Registro em outra ala</option>
                <option value="falecido">Falecido</option>
              </select>
            </div>
          </div>
          <div className="linha-campos">
            <div className="campo">
              <label>Família</label>
              <select value={dados.familia_id || ''} onChange={(e) => mudar('familia_id', e.target.value)}>
                <option value="">Sem família vinculada</option>
                {familias.map((f) => <option key={f.id} value={f.id}>{f.nome_familia}</option>)}
              </select>
            </div>
            <div className="campo">
              <label>Pode servir em chamados</label>
              <select value={String(dados.pode_servir_chamado)} onChange={(e) => mudar('pode_servir_chamado', e.target.value === 'true')}>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
          </div>
          <div className="barra-acoes">
            <button type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
            <button type="button" className="secundario" onClick={() => navegar('/membros')}>Cancelar</button>
            {id && <button type="button" className="secundario" onClick={arquivar}>Arquivar membro</button>}
          </div>
        </fieldset>
      </form>
    </>
  )
}
