# 📉 Peso Tracker – Monitor de Emagrecimento

Aplicação simples e eficiente construída em **Next.js + React + TypeScript** para acompanhar a evolução do peso corporal ao longo do tempo.  
Os dados são armazenados localmente em um arquivo **CSV**, permitindo total privacidade.

Inclui:

✔ Registro diário de peso  
✔ Gráfico com animação utilizando **Recharts**  
✔ Remoção de registros  
✔ Limpeza completa dos dados  
✔ Interface dark moderna  
✔ Dados persistidos localmente em `data/weights.csv`

---

## 🖼️ Preview do Projeto
<img width="939" height="857" alt="image" src="https://github.com/user-attachments/assets/b9611dd3-47a4-4432-80ca-1b7e45f7952c" />

## 📦 Tecnologias Utilizadas

- **Next.js 14 (App Router)**
- **React 18**
- **TypeScript**
- **Recharts**
- **CSV Local para persistência**
- **Node.js (File System)**

---

## 📁 Estrutura do Projeto
peso-tracker/
├─ app/
│ ├─ api/
│ │ └─ weights/
│ │ └─ route.ts # API de leitura/escrita no CSV
│ └─ page.tsx # Interface principal com gráfico animado
│
├─ data/
│ └─ weights.csv # Dados de peso (não vai para o Git)
│
├─ .gitignore
├─ package.json
├─ README.md
