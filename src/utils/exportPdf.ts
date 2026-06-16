import { jsPDF } from 'jspdf';

const fmtEUR = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
});

export interface QuotePdfData {
  filename: string;
  id?: number;
  date?: string;
  model: string;
  engine?: string;
  color?: string;
  optionals: Array<{ name: string; price?: number }>;
  basePrice?: number;
  engineExtra?: number;
  colorExtra?: number;
  total: number;
}

function addRow(doc: jsPDF, y: number, margin: number, pageWidth: number, label: string, value: string) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(label, margin, y);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(value, pageWidth - margin, y, { align: 'right' });
  return y + 8;
}

export function downloadQuotePdf(data: QuotePdfData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Preventivo Renault', margin, 27);

  y = 58;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (data.id != null) {
    doc.text(`ID preventivo: #${data.id}`, margin, y);
    y += 7;
  }
  if (data.date) {
    doc.text(`Data: ${data.date}`, margin, y);
    y += 7;
  }

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Dettaglio configurazione', margin, y);
  y += 12;

  y = addRow(doc, y, margin, pageWidth, 'Modello', data.model);
  y = addRow(doc, y, margin, pageWidth, 'Motore', data.engine || '-');
  y = addRow(doc, y, margin, pageWidth, 'Colore', data.color || '-');

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Equipaggiamento', margin, y);
  y += 9;

  if (data.optionals.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Nessun optional selezionato', margin, y);
    y += 8;
  } else {
    data.optionals.forEach((opt) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const extra = opt.price != null && opt.price > 0 ? ` (+${fmtEUR.format(opt.price)})` : '';
      doc.text(`- ${opt.name}${extra}`, margin + 2, y);
      y += 7;
    });
  }

  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  if (data.basePrice != null) {
    y = addRow(doc, y, margin, pageWidth, 'Prezzo base', fmtEUR.format(data.basePrice));
  }
  if (data.engineExtra != null && data.engineExtra > 0) {
    y = addRow(doc, y, margin, pageWidth, 'Extra motore', fmtEUR.format(data.engineExtra));
  }
  if (data.colorExtra != null && data.colorExtra > 0) {
    y = addRow(doc, y, margin, pageWidth, 'Extra colore', fmtEUR.format(data.colorExtra));
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Totale', margin + 5, y + 12);
  doc.text(fmtEUR.format(data.total), pageWidth - margin - 5, y + 12, { align: 'right' });

  doc.save(data.filename);
}
