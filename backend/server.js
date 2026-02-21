const express = require("express")
const cors = require("cors")
const axios = require("axios")
const url = require("url")

const app = express()
app.use(cors())
app.use(express.json())

function calculateRisk(target) {
  let risk = 0
  const flags = []

  if (target.includes("@")) {
    risk += 20
    flags.push("Contains @ symbol")
  }

  if (target.length > 75) {
    risk += 10
    flags.push("Very long URL")
  }

  if (target.includes("login") || target.includes("verify")) {
    risk += 20
    flags.push("Phishing keyword")
  }

  if (target.includes(".xyz") || target.includes(".top") || target.includes(".site")) {
    risk += 25
    flags.push("Suspicious TLD")
  }

  return { risk, flags }
}

app.get("/scan", async (req, res) => {
  const url = req.query.url;

  if (!url) return res.status(400).json({ error: "no url" });

  let risk = 0;
  const explanations = [];

  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;

    // 🔎 keyword phishing
    const keywords = ["login", "secure", "verify", "account", "update"];
    keywords.forEach(k => {
      if (domain.includes(k)) {
        risk += 15;
        explanations.push(`Contains phishing keyword: ${k}`);
      }
    });

    // 🔎 panjang domain
    if (domain.length > 25) {
      risk += 10;
      explanations.push("Domain is unusually long");
    }

    // 🔎 banyak dash
    if ((domain.match(/-/g) || []).length > 2) {
      risk += 10;
      explanations.push("Too many dashes in domain");
    }

    // 🔎 http tanpa ssl
    if (!url.startsWith("https")) {
      risk += 20;
      explanations.push("Not using HTTPS");
    }

    // 🔎 TLD aneh
    const suspiciousTLD = ["xyz", "top", "click", "gq"];
    const tld = domain.split(".").pop();

    if (suspiciousTLD.includes(tld)) {
      risk += 15;
      explanations.push(`Suspicious TLD: .${tld}`);
    }

    const status =
      risk < 30 ? "Low risk" :
      risk < 60 ? "Medium risk" :
      "High risk";

    res.json({
      risk,
      status,
      explanations,
      details: {
        domain,
        tld,
        https: url.startsWith("https") ? "yes" : "no"
      }
    });

  } catch {
    res.status(400).json({ error: "invalid url" });
  }
});


app.get("/", (req,res)=>{
  res.send("CyberLab backend running")
})

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})
