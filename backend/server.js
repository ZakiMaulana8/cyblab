const express = require("express");
const cors = require("cors");
const whois = require("whois-json");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/scan", async (req, res) => {
  let targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: "no url" });

  // auto tambah https kalau user ga tulis
  if (!targetUrl.startsWith("http")) {
    targetUrl = "https://" + targetUrl;
  }

  let risk = 0;
  const explanations = [];
  let domainAgeDays = null;
  let domain = "";
  let tld = "";

  try {
    const parsed = new URL(targetUrl);
    domain = parsed.hostname.toLowerCase();
    tld = domain.split(".").pop();

    // 🔎 keyword phishing
    const keywords = ["login", "secure", "verify", "account", "update"];
    keywords.forEach(k => {
      if (domain.includes(k)) {
        risk += 15;
        explanations.push(`Contains phishing keyword: ${k}`);
      }
    });

    // 🔎 domain panjang
    if (domain.length > 25) {
      risk += 10;
      explanations.push("Domain is unusually long");
    }

    // 🔎 dash
    if ((domain.match(/-/g) || []).length > 2) {
      risk += 10;
      explanations.push("Too many dashes in domain");
    }

    // 🔎 https
    if (!targetUrl.startsWith("https")) {
      risk += 20;
      explanations.push("Not using HTTPS");
    }

    // 🔎 suspicious tld
    const suspiciousTLD = ["xyz", "top", "click", "gq", "site"];
    if (suspiciousTLD.includes(tld)) {
      risk += 15;
      explanations.push(`Suspicious TLD: .${tld}`);
    }

    // 🔎 WHOIS
    try {
      const info = await whois(domain);

      let creation = info.creationDate || info.created || info.domainCreated;

      if (Array.isArray(creation)) creation = creation[0];

      if (creation) {
        const created = new Date(creation);
        const now = new Date();

        if (!isNaN(created)) {
          domainAgeDays = Math.floor((now - created) / 86400000);

          if (domainAgeDays < 30) {
            risk += 25;
            explanations.push("Domain is very new (<30 days)");
          } else if (domainAgeDays < 180) {
            risk += 10;
            explanations.push("Domain is relatively new");
          }
        }
      }
    } catch (e) {
      console.log("WHOIS error:", e.message);
      explanations.push("Could not fetch domain age");
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
        https: targetUrl.startsWith("https") ? "yes" : "no",
        domain_age_days: domainAgeDays ?? "unknown"
      }
    });

  } catch (e) {
    res.status(400).json({ error: "invalid url" });
  }
});

app.get("/", (req, res) => {
  res.send("CyberLab backend running");
});

/* ⭐ GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
