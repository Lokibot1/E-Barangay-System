import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";

  const normalized =
    typeof value === "string"
      ? value
      : value instanceof Date
        ? value.toISOString()
        : String(value);

  return `"${normalized.replace(/"/g, '""')}"`;
};

export const downloadRecordsAsCsv = ({
  filename = "records.csv",
  columns = [],
  rows = [],
} = {}) => {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  if (safeColumns.length === 0) {
    throw new Error("CSV export requires at least one column.");
  }

  const headerRow = safeColumns
    .map((column) => escapeCsvValue(column.header || column.key || "Column"))
    .join(",");

  const dataRows = safeRows.map((row) =>
    safeColumns
      .map((column) => {
        const rawValue =
          typeof column.value === "function"
            ? column.value(row)
            : row?.[column.key];

        return escapeCsvValue(rawValue);
      })
      .join(","),
  );

  const csv = [headerRow, ...dataRows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadRecordsAsPdf = ({
  filename = "records.pdf",
  title = "Records",
  columns = [],
  rows = [],
  filterInfo = "",
} = {}) => {
  try {
    console.log('Starting PDF export...', { filename, title, columns: columns.length, rows: rows.length });

    // Check if jsPDF is available
    if (typeof jsPDF === 'undefined') {
      throw new Error('jsPDF library is not loaded');
    }

    const doc = new jsPDF('landscape');
    console.log('jsPDF instance created');

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 20);

    // Add filter info if provided
    if (filterInfo) {
      doc.setFontSize(10);
      doc.text(`Filters: ${filterInfo}`, 14, 30);
    }

    // Prepare table data
    const headers = columns.map(col => col.header || col.key || "Column");
    const body = rows.map(row =>
      columns.map(col => {
        const rawValue = typeof col.value === "function" ? col.value(row) : row?.[col.key];
        return String(rawValue ?? "");
      })
    );

    console.log('PDF data prepared:', { headers, bodyLength: body.length });

    if (typeof autoTable === 'undefined') {
      console.warn('autoTable not available, creating simple PDF');
      let yPos = filterInfo ? 40 : 30;
      body.forEach((row, index) => {
        doc.text(`${index + 1}. ${row.join(' | ')}`, 14, yPos);
        yPos += 10;
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    } else {
      autoTable(doc, {
        head: [headers],
        body: body,
        startY: filterInfo ? 35 : 25,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
    }

    console.log('PDF generated, saving...');
    // Download the PDF using blob method
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('PDF downloaded successfully');
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('Failed to export PDF: ' + error.message);
  }
};
