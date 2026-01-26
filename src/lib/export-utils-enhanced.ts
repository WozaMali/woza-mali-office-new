import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type TopItem = { title?: string; name?: string; watches?: number; credits?: number }

export async function exportToEnhancedPDF(opts: {
  title: string
  filename: string
  columns: string[]
  rows: Record<string, any>[]
  logoPath?: string
  summary?: Record<string, any>
  dateRange?: { start_date?: string; end_date?: string }
  filters?: Record<string, any>
  topPerformers?: { topVideos?: TopItem[]; topUsers?: TopItem[] }
}) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text(opts.title, 14, 20)

  if (opts.logoPath) {
    try {
      const res = await fetch(opts.logoPath)
      const blob = await res.blob()
      const reader = new FileReader()
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      doc.addImage(dataUrl, 'PNG', 160, 10, 35, 15)
    } catch {}
  }

  doc.setFontSize(11)
  const meta: string[] = []
  if (opts.dateRange?.start_date || opts.dateRange?.end_date) {
    meta.push(`Date: ${opts.dateRange.start_date || 'all'} → ${opts.dateRange.end_date || 'all'}`)
  }
  if (opts.filters) {
    const f = Object.entries(opts.filters)
      .filter(([_, v]) => v != null && v !== '')
      .map(([k, v]) => `${k}: ${v}`)
    if (f.length) meta.push(`Filters: ${f.join(', ')}`)
  }
  if (meta.length) doc.text(meta.join(' | '), 14, 30)

  if (opts.summary) {
    const sumRows = Object.entries(opts.summary).map(([k, v]) => ({ Metric: k, Value: v }))
    autoTable(doc, {
      head: [['Metric', 'Value']],
      body: sumRows.map(r => [String(r.Metric), String(r.Value)]),
      startY: 36
    })
  }

  const startY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 36
  autoTable(doc, {
    head: [opts.columns],
    body: opts.rows.map(r => opts.columns.map(c => r[c] != null ? String(r[c]) : '')),
    startY
  })

  let nextY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : startY + 10
  if (opts.topPerformers?.topVideos?.length) {
    autoTable(doc, {
      head: [['Top Videos', 'Watches', 'Credits']],
      body: opts.topPerformers.topVideos.map(t => [t.title || '', String(t.watches || 0), String(t.credits || 0)]),
      startY: nextY
    })
    nextY = (doc as any).lastAutoTable.finalY + 6
  }
  if (opts.topPerformers?.topUsers?.length) {
    autoTable(doc, {
      head: [['Top Users', 'Watches', 'Credits']],
      body: opts.topPerformers.topUsers.map(t => [t.name || '', String(t.watches || 0), String(t.credits || 0)]),
      startY: nextY
    })
  }

  doc.save(opts.filename || 'report.pdf')
}

