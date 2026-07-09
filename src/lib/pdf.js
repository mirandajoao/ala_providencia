import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ROTULO_STATUS = {
  ativo: 'Ativo',
  menos_ativo: 'Menos ativo',
  mudou_se: 'Mudou-se',
  registro_outra_ala: 'Registro em outra ala',
  falecido: 'Falecido',
}

export function exportarMembrosPDF(membros, filtrosDescricao) {
  const doc = new jsPDF()
  doc.setFont('times', 'bold')
  doc.setFontSize(14)
  doc.text('Ala Providência — Lista de Membros', 14, 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}${filtrosDescricao ? ' · ' + filtrosDescricao : ''}`, 14, 22)
  doc.text('Documento de uso interno do conselho da ala. Contém dados pessoais — não compartilhar.', 14, 27)

  autoTable(doc, {
    startY: 32,
    head: [['Nome', 'Nascimento', 'Telefone', 'Status', 'Família']],
    body: membros.map((m) => [
      m.nome_completo,
      m.data_nascimento ? m.data_nascimento.split('-').reverse().join('/') : '—',
      m.telefone || '—',
      ROTULO_STATUS[m.status] || m.status,
      m.familias?.nome_familia || '—',
    ]),
    styles: { fontSize: 8.5 },
    headStyles: { fillColor: [31, 58, 95] },
  })

  doc.save('membros-ala-providencia.pdf')
}
