import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { usuario } = useAuth()
  const [resumo, setResumo] = useState(null)
  const [aniversariantes, setAniversariantes] = useState([])

  useEffect(() => {
    async function carregar() {
      const [membros, familias, prioritarias, semFamilia] = await Promise.all([
        supabase.from('membros').select('id', { count: 'exact', head: true }).eq('arquivado', false),
        supabase.from('familias').select('id', { count: 'exact', head: true }).eq('arquivado', false),
        supabase.from('familias').select('id', { count: 'exact', head: true }).eq('acompanhamento_prioritario', true).eq('arquivado', false),
        supabase.from('membros').select('id', { count: 'exact', head: true }).is('familia_id', null).eq('arquivado', false),
      ])
      setResumo({
        membros: membros.count ?? 0,
        familias: familias.count ?? 0,
        prioritarias: prioritarias.count ?? 0,
        semFamilia: semFamilia.count ?? 0,
      })

      const { data } = await supabase
        .from('membros')
        .select('id, nome_completo, data_nascimento')
        .eq('arquivado', false)
        .not('data_nascimento', 'is', null)
      const mesAtual = new Date().getMonth() + 1
      const doMes = (data || [])
        .filter((m) => Number(m.data_nascimento.slice(5, 7)) === mesAtual)
        .sort((a, b) => a.data_nascimento.slice(8, 10).localeCompare(b.data_nascimento.slice(8, 10)))
      setAniversariantes(doMes)
    }
    carregar()
  }, [])

  return (
    <>
      <h1>Bem-vindo, {usuario?.nome_exibicao?.split(' ')[0]}</h1>
      <p style={{ color: 'var(--texto-suave)', fontSize: '0.88rem' }}>
        Resumo geral da Ala Providência
      </p>

      <div className="grade-resumo">
        <div className="cartao"><div className="resumo-num">{resumo?.membros ?? '—'}</div><div className="resumo-rotulo">Membros ativos no cadastro</div></div>
        <div className="cartao"><div className="resumo-num">{resumo?.familias ?? '—'}</div><div className="resumo-rotulo">Famílias cadastradas</div></div>
        <div className="cartao"><div className="resumo-num">{resumo?.prioritarias ?? '—'}</div><div className="resumo-rotulo">Famílias em acompanhamento prioritário</div></div>
        <div className="cartao"><div className="resumo-num">{resumo?.semFamilia ?? '—'}</div><div className="resumo-rotulo">Membros sem família vinculada</div></div>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <section className="cartao">
          <h2>Aniversariantes do mês</h2>
          {aniversariantes.length === 0 ? (
            <p className="vazio">Nenhum aniversariante neste mês.</p>
          ) : (
            <ul style={{ listStyle: 'none', marginTop: '0.6rem' }}>
              {aniversariantes.map((m) => (
                <li key={m.id} style={{ padding: '0.4rem 0', borderBottom: '1px solid var(--borda)', fontSize: '0.88rem' }}>
                  <strong>dia {m.data_nascimento.slice(8, 10)}</strong> — <Link to={`/membros/${m.id}`}>{m.nome_completo}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="cartao">
          <h2>Prioridades da semana</h2>
          <p className="vazio">
            As tarefas e pendências do conselho aparecerão aqui quando o módulo de
            atribuições (Fase 2) for ativado.
          </p>
        </section>
      </div>
    </>
  )
}
