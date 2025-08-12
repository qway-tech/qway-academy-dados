import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Se estiver usando Node <18
import type { Request, Response } from "express";

dotenv.config();
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

interface GitHubTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
}

interface GitHubUserResponse {
  login: string;
  name: string | null;
  email: string | null;
}

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5173/auth/callback";

app.post("/auth/token", async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Código de autorização ausente." });
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res
      .status(500)
      .json({ error: "Variáveis de ambiente não configuradas." });
  }

  console.log("client_id", GITHUB_CLIENT_ID);
  console.log("client_secret", GITHUB_CLIENT_SECRET);
  console.log("code recebido", code);

  try {
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
        }),
      },
    );

    const tokenData = (await tokenRes.json()) as GitHubTokenResponse;
    console.log("tokenData", tokenData);

    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Token inválido" });
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    const userData = (await userRes.json()) as GitHubUserResponse;

    return res.json({
      access_token: tokenData.access_token,
      user: {
        name: userData.name ?? userData.login,
        email: userData.email ?? "sem-email@github.com",
      },
    });
  } catch (err) {
    console.error("Erro ao autenticar com GitHub:", err);
    return res.status(500).json({ error: "Erro ao autenticar" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
