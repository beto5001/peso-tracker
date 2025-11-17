import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export interface WeightEntry {
  date: string;
  weight: number;
}

const csvFilePath: string = path.join(process.cwd(), "data", "weights.csv");

function ensureCsvFileExists(): void {
  if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, "date,weight\n", { encoding: "utf8" });
  }
}

function parseCsvToJson(csvContent: string): WeightEntry[] {
  const lines = csvContent.trim().split("\n");
  const [, ...rows] = lines;

  return rows
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [date, weight] = line.split(",");
      return { date, weight: Number(weight) };
    });
}

function writeFullCsv(data: WeightEntry[]): void {
  const header = "date,weight";
  const lines = data.map((d) => `${d.date},${d.weight}`);
  fs.writeFileSync(csvFilePath, header + "\n" + lines.join("\n"));
}

function appendLineToCsv(date: string, weight: number): void {
  const line = `\n${date},${weight}`;
  fs.appendFileSync(csvFilePath, line);
}

export async function GET() {
  try {
    ensureCsvFileExists();
    const csv = fs.readFileSync(csvFilePath, "utf8");
    const data = parseCsvToJson(csv);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erro ao ler CSV" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { date, weight } = await request.json();
    if (!date || !weight) {
      return NextResponse.json(
        { error: "Data e peso obrigatórios" },
        { status: 400 }
      );
    }

    ensureCsvFileExists();
    appendLineToCsv(date, Number(weight));

    return NextResponse.json({ message: "Peso salvo" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

// DELETE (remover item OU limpar tudo)
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const clearAll = url.searchParams.get("all");

  ensureCsvFileExists();
  const csv = fs.readFileSync(csvFilePath, "utf8");
  const data = parseCsvToJson(csv);

  // Limpar tudo
  if (clearAll === "true") {
    writeFullCsv([]);
    return NextResponse.json({ message: "Todos os registros foram apagados." });
  }

  // Remover item específico
  const { date, weight } = await request.json();
  if (!date || weight === undefined) {
    return NextResponse.json(
      { error: "Informe data e peso para deletar." },
      { status: 400 }
    );
  }

  const filtered = data.filter(
    (d) => !(d.date === date && d.weight === Number(weight))
  );

  writeFullCsv(filtered);

  return NextResponse.json({ message: "Registro removido" });
}
