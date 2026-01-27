import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ExportRow = Record<string, string | number | boolean | null | undefined>;

export interface GenericPDFOptions {
  title: string;
  filename: string;
  columns: string[];
  rows: ExportRow[];
  logoPath?: string;
  reportType?: string;
  summary?: Record<string, any>;
  topPerformers?: Record<string, any[]>;
}

async function fetchImageAsBase64(path: string): Promise<string | null> {
  try {
    const res = await fetch(path);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Error fetching image for PDF:', e);
    return null;
  }
}

export async function exportToGenericPDF(options: GenericPDFOptions) {
  const { title, filename, columns, rows, logoPath, summary, topPerformers } = options;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  let currentY = 15;

  // Add Logo
  if (logoPath) {
    try {
      const base64 = await fetchImageAsBase64(logoPath);
      if (base64) {
        // Assume PNG or JPEG based on extension or just try PNG
        const format = logoPath.toLowerCase().endsWith('.jpg') || logoPath.toLowerCase().endsWith('.jpeg') ? 'JPEG' : 'PNG';
        const imgProps = doc.getImageProperties(base64);
        const imgWidth = 40;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        doc.addImage(base64, format, 14, currentY, imgWidth, imgHeight);
      }
    } catch (e) {
      console.warn('Could not add logo to PDF', e);
    }
  }

  // Title
  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, currentY + 10, { align: 'center' });
  currentY += 25;

  // Summary Section
  if (summary) {
    doc.setFontSize(14);
    doc.text('Summary', 14, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    const summaryKeys = Object.keys(summary);
    // Print in 2 columns
    summaryKeys.forEach((key, index) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const value = summary[key];
      // Format numbers
      const displayValue = typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value;
      
      const xOffset = index % 2 === 0 ? 14 : pageWidth / 2 + 10;
      doc.text(`${label}: ${displayValue}`, xOffset, currentY);
      
      if (index % 2 !== 0) currentY += 6;
    });
    if (summaryKeys.length % 2 !== 0) currentY += 6;
    currentY += 5;
  }

  // Top Performers Section
  if (topPerformers && Object.keys(topPerformers).length > 0) {
    doc.setFontSize(14);
    doc.text('Top Performers', 14, currentY);
    currentY += 8;

    Object.entries(topPerformers).forEach(([category, items]) => {
      doc.setFontSize(11);
      const catLabel = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      doc.text(catLabel, 14, currentY);
      currentY += 5;

      doc.setFontSize(10);
      items.forEach((item: any, i) => {
        const text = `${i + 1}. ${item.name} - ${item.count || 0} collections (Value: ${typeof item.value === 'number' ? item.value.toFixed(2) : item.value})`;
        doc.text(text, 20, currentY);
        currentY += 5;
      });
      currentY += 5;
    });
  }

  // Table
  const tableData = rows.map(row => columns.map(col => row[col]));
  
  autoTable(doc, {
    head: [columns],
    body: tableData,
    startY: currentY + 5,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    margin: { top: 20 },
    didDrawPage: (data) => {
        // Footer or Header on new pages
    }
  });

  doc.save(filename);
}
