"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface WeightEntry {
  date: string;
  weight: number;
}

interface ChartPoint {
  name: string;
  weight: number;
}

const HomePage: React.FC = () => {
  const [pesos, setPesos] = useState<WeightEntry[]>([]);
  const [data, setData] = useState<string>("");
  const [peso, setPeso] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true); // evita problemas de SSR com Recharts
  }, []);

  async function carregarPesos(): Promise<void> {
    try {
      setCarregando(true);
      setErro("");

      const res: Response = await fetch("/api/weights");
      const json = await res.json();

      if (!res.ok) {
        setErro(json?.error ?? "Erro ao buscar dados.");
        return;
      }

      const lista: WeightEntry[] = Array.isArray(json) ? json : [];

      const ordenados: WeightEntry[] = [...lista].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setPesos(ordenados);
    } catch (error) {
      console.error(error);
      setErro("Erro ao comunicar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarPesos();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErro("");

    if (!data || !peso) {
      setErro("Preencha data e peso.");
      return;
    }

    try {
      const response: Response = await fetch("/api/weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: data, weight: Number(peso) }),
      });

      const json = await response.json();

      if (!response.ok) {
        setErro(json?.error ?? "Erro ao salvar peso.");
        return;
      }

      setData("");
      setPeso("");
      await carregarPesos();
    } catch (error) {
      console.error(error);
      setErro("Erro ao comunicar com o servidor.");
    }
  }

  async function excluirRegistro(entry: WeightEntry): Promise<void> {
    try {
      await fetch("/api/weights", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      await carregarPesos();
    } catch (error) {
      console.error(error);
      setErro("Erro ao excluir registro.");
    }
  }

  async function limparTudo(): Promise<void> {
    try {
      await fetch("/api/weights?all=true", {
        method: "DELETE",
      });

      await carregarPesos();
    } catch (error) {
      console.error(error);
      setErro("Erro ao limpar registros.");
    }
  }

  const maxPeso: number =
    pesos.length > 0 ? Math.max(...pesos.map((p) => p.weight)) : 0;
  const minPeso: number =
    pesos.length > 0 ? Math.min(...pesos.map((p) => p.weight)) : 0;

  function formatarDataCurta(dateString: string): string {
    const dataObj: Date = new Date(dateString);
    if (Number.isNaN(dataObj.getTime())) {
      return dateString;
    }

    const dia: string = dataObj.getDate().toString().padStart(2, "0");
    const mes: string = (dataObj.getMonth() + 1).toString().padStart(2, "0");

    return `${dia}/${mes}`;
  }

  const chartData: ChartPoint[] = pesos.map((p) => ({
    name: formatarDataCurta(p.date),
    weight: p.weight,
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        backgroundColor: "#0f172a",
        color: "#f9fafb",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          backgroundColor: "#020617",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 20px 30px rgba(0,0,0,0.6)",
          border: "1px solid #1f2937",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1.5rem",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>
              Monitor de Emagrecimento
            </h1>
            <p style={{ marginBottom: "0.2rem", color: "#9ca3af" }}>
              Registre seu peso e acompanhe a evolução.
            </p>
            {pesos.length > 0 && (
              <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                De <strong>{minPeso.toFixed(1)} kg</strong> até{" "}
                <strong>{maxPeso.toFixed(1)} kg</strong>
              </p>
            )}
          </div>

          <button
            onClick={limparTudo}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "999px",
              border: "1px solid #b91c1c",
              backgroundColor: "#7f1d1d",
              color: "#fee2e2",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Limpar todos registros
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "2rem",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "0.3rem", fontSize: "0.9rem" }}>
              Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(event) => setData(event.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #4b5563",
                backgroundColor: "#020617",
                color: "#f9fafb",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "0.3rem", fontSize: "0.9rem" }}>
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={peso}
              onChange={(event) => setPeso(event.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #4b5563",
                backgroundColor: "#020617",
                color: "#f9fafb",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "0.7rem 1.5rem",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              background:
                "linear-gradient(135deg, #22c55e 0%, #16a34a 40%, #22c55e 100%)",
              color: "#022c22",
              fontWeight: 600,
              marginTop: "1.35rem",
            }}
          >
            Adicionar peso
          </button>
        </form>

        {erro && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              backgroundColor: "#7f1d1d",
              color: "#fee2e2",
              fontSize: "0.9rem",
            }}
          >
            {erro}
          </div>
        )}

        {carregando ? (
          <p>Carregando dados...</p>
        ) : pesos.length === 0 ? (
          <p>Nenhum peso cadastrado ainda. Comece adicionando o primeiro 🙂</p>
        ) : (
          <>
            {/* GRÁFICO DE BARRAS COM RECHARTS */}
            <div
              style={{
                height: "600px",
                marginBottom: "2rem",
                backgroundColor: "#020617",
                borderRadius: "0.75rem",
                border: "1px solid #1f2937",
                padding: "1rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1rem",
                  marginBottom: "0.5rem",
                  color: "#e5e7eb",
                }}
              >
                Evolução do peso (gráfico)
              </h2>
              {isClient && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <YAxis
                      domain={[65, 110]}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid #374151",
                        borderRadius: "0.5rem",
                        fontSize: "0.85rem",
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                      cursor={{ fill: "rgba(55,65,81,0.3)" }}
                    />
                    <Bar
                      dataKey="weight"
                      fill="#22C55E"   // 💚 verde bem vivo
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* LISTA COM BARRAS HORIZONTAIS + BOTÃO REMOVER */}
            <div>
              <h2
                style={{
                  fontSize: "1rem",
                  marginBottom: "0.8rem",
                  color: "#e5e7eb",
                }}
              >
                Histórico detalhado
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                }}
              >
                {pesos.map((p) => {
                  const percent: number =
                    maxPeso === minPeso
                      ? 100
                      : ((p.weight - minPeso) / (maxPeso - minPeso)) * 100;

                  return (
                    <div
                      key={`${p.date}-${p.weight}`}
                      style={{
                        paddingBottom: "0.6rem",
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.2rem",
                          fontSize: "0.9rem",
                          color: "#9ca3af",
                        }}
                      >
                        <span>
                          {formatarDataCurta(p.date)} —{" "}
                          <strong>{p.weight.toFixed(1)} kg</strong>
                        </span>
                        <button
                          onClick={() => void excluirRegistro(p)}
                          style={{
                            backgroundColor: "#b91c1c",
                            color: "#fee2e2",
                            padding: "0.15rem 0.6rem",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            border: "none",
                          }}
                        >
                          Remover
                        </button>
                      </div>
                      <div
                        style={{
                          height: "10px",
                          borderRadius: "999px",
                          backgroundColor: "#020617",
                          border: "1px solid #1e293b",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${percent}%`,
                            background:
                              "linear-gradient(90deg, #22c55e, #a3e635, #22c55e)",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
