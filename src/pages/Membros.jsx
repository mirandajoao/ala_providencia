import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { exportarMembrosPDF } from '../lib/pdf'

const ROTULO_STATUS = {
  ativo: 'Ativo',
  menos_ativo: 'Menos ativo',
  mudou_se: 'Mudou-se',
  registro_outra_ala: 'Outra ala',
  falecido: 'Falecido',
}

export default function Membros() {
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const [membros, setMembros] = useState([])
  const [busca, setBusca] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fSacerdocio, setFSacerdocio] = useState('')
  const [fSexo, setFSexo] = useState('')
  const [carregando, setCarregando] = useState(true)

  const podeEditar = ['admin', 'bispado', 'secretario'].includes(usuario?.perfil)

  useEffect(() => {
    supabase
      .from('membros')
      .select('id, nome_completo, data_nascimento, telefone, sexo, sacerdocio, status, familias(nome_familia)')
      .eq('arquivado', false)
      .order('nome_completo')
      .then(({ data }) => {
        setMembros(data || [])
        setCarregando(false)
      })
  }, [])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return membros.filter((m) =>
      (!termo || m.nome_completo.toLowerCase().includes(termo)) &&
      (!fStatus || m.status === fStatus) &&
      (!fSacerdocio || m.sacerdocio === fSacerdocio) &&
      (!fSexo || m.sexo === fSexo)
    )
  }, [membros, busca, fStatus, fSacerdocio, fSexo])

  function exportar() {
    const partes = []
    if (fStatus) partes.push(`status: ${ROTULO_STATUS[fStatus]}`)
    if (fSexo) partes.push(`sexo: ${fSexo}`)
    if (busca) partes.push(`busca: "${busca}"`)
    exportarMembrosPDF(filtrados, partes.join(', '))
  }

  return (
    <>
      <h1>Membros</h1>
      <div className="barra-acoes">
        <input
          type="search"
          placeholder="Buscar por nome…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(ROTULO_STATUS).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>
        <select value={fSexo} onChange={(e) => setFSexo(e.target.value)}>
          <option value="">Todos</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
        </select>
        <select value={fSacerdocio} onChange={(e) => setFSacerdocio(e.target.value)}>
          <option value="">Todo sacerdócio</option>
          <option value="nenhum">Nenhum</option>
          <option value="diacono">Diácono</option>
          <option value="mestre">Mestre</option>
          <option value="sacerdote">Sacerdote</option>
          <option value="elder">Élder</option>
          <option value="sumo_sacerdote">Sumo sacerdote</option>
        </select>
        <span style={{ flex: 1 }} />
        <button className="secundario" onClick={exportar} disabled={filtrados.length === 0}>
          Exportar PDF
        </button>
        {podeEditar && <button onClick={() => navegar('/membros/novo')}>Novo membro</button>}
      </div>

      {carregando ? (
        <p className="vazio">Carregando membros…</p>
      ) : filtrados.length === 0 ? (
        <div className="cartao vazio">Nenhum membro encontrado com os filtros atuais.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th className="ocultavel">Telefone</th>
              <th className="ocultavel">Família</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((m) => (
              <tr key={m.id}>
                <td><Link to={`/membros/${m.id}`}>{m.nome_completo}</Link></td>
                <td className="ocultavel">{m.telefone || '—'}</td>
                <td className="ocultavel">{m.familias?.nome_familia || '—'}</td>
                <td><span className={`etiqueta ${m.status === 'ativo' ? 'ativo' : m.status === 'menos_ativo' ? 'menos_ativo' : 'neutro'}`}>{ROTULO_STATUS[m.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ fontSize: '0.78rem', color: 'var(--texto-suave)', marginTop: '0.6rem' }}>
        {filtrados.length} membro(s) na lista
      </p>
    </>
  )
}
