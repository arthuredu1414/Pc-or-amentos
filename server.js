// ===== IMPORTS =====
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

// ===== CONFIG =====
app.use(cors());
app.use(express.json());

// 🔑 COLOCA SUA API KEY AQUI
const API_KEY = ""; // ex: sk-ant-xxxxx

// ===== ROTA PRINCIPAL =====
app.post("/buscar-precos", async (req, res) => {
  const lista = req.body.lista;

  if (!lista) {
    return res.status(400).json({ erro: "Lista não enviada" });
  }

  const prompt = `Você é especialista em hardware no Brasil.
Retorne preços aproximados em reais (R$) para os itens abaixo:

${lista}

Responda APENAS em JSON:
[
  { "nome": "produto", "preco": 1234 }
]`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    // 🔍 Extrai o texto da resposta da IA
    let texto = data.content?.[0]?.text || "[]";

    try {
      const json = JSON.parse(texto);
      res.json(json);
    } catch {
      res.status(500).json({
        erro: "Erro ao interpretar resposta da IA",
        raw: texto
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao chamar API" });
  }
});

// ===== START SERVIDOR =====
app.listen(3000, () => {
  console.log("🚀 Servidor rodando em: http://"");
});