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
