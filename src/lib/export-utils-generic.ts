
// Stub for generic PDF export
export async function performExportToGenericPDF(options: any): Promise<void> {
  console.warn('Generic PDF export is disabled (stub)', options);
  alert('PDF export is currently disabled.');
}

export const exportToGenericPDF = performExportToGenericPDF;
