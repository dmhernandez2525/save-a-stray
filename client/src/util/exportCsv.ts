import { Animal } from "../types";

export function exportAnimalsCsv(animals: Animal[], shelterName: string): void {
  const headers = ["Name", "Type", "Breed", "Age", "Sex", "Color", "Status", "Description"];
  const rows = animals.map((a) => [
    escapeCsvField(a.name),
    escapeCsvField(a.type),
    escapeCsvField(a.breed || ""),
    String(a.age),
    escapeCsvField(a.sex),
    escapeCsvField(a.color),
    escapeCsvField(a.status || "available"),
    escapeCsvField(a.description || "")
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${shelterName.replace(/[^a-zA-Z0-9]/g, "_")}_animals.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
