const express = require("express");
const cors = require("cors");
const whois = require("whois-json");
const axios = require("axios");
const cheerio = require("cheerio");

const brands = ["google","instagram","facebook","paypal","apple","bca","ovo","dana"];

const app = express();
app.use(cors());
app.use(express.json());

app.get("/scan", async (req, res) => {
  let targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: "no url" });

  if (!targetUrl.startsWith("http")) {
    targetUrl = "https://" + targetUrl;
  }

  let risk = 0;
  const explanations = [];
  let domainAgeDays = null;
  let domain = "";
  let tld = "";
  let redirectCount = 0;

  try {
    const parsed = new URL(targetUrl);
    domain = parsed.hostname.toLowerCase();
    tld = domain.split(".").pop();

    // 🔎 keyword phishing
    ["login","secure","verify","account","update"].forEach(k=>{
      if(domain.includes(k)){
        risk+=15;
        explanations.push(`Contains phishing keyword: ${k}`);
      }
    });

    // 🔎 domain panjang
    if(domain.length>25){
      risk+=10;
      explanations.push("Domain is unusually long");
    }

    // 🔎 brand impersonation
    brands.forEach(b=>{
      if(domain.includes(b) && !domain.endsWith(`${b}.com`)){
        risk+=25;
        explanations.push(`Possible impersonation of ${b}`);
      }
    });

    // 🔎 dash
    if((domain.match(/-/g)||[]).length>2){
      risk+=10;
      explanations.push("Too many dashes in domain");
    }

    // 🔎 https
    if(!targetUrl.startsWith("https")){
      risk+=20;
      explanations.push("Not using HTTPS");
    }

    // 🔎 suspicious TLD
    if(["xyz","top","click","gq","site"].includes(tld)){
      risk+=15;
      explanations.push(`Suspicious TLD: .${tld}`);
    }

    // 🔎 WHOIS
    try{
      const info = await whois(domain);
      let creation = info.creationDate || info.created || info.domainCreated;

      if(Array.isArray(creation)) creation=creation[0];

      if(creation){
        const created=new Date(creation);
        if(!isNaN(created)){
          domainAgeDays=Math.floor((Date.now()-created)/86400000);

          if(domainAgeDays<30){
            risk+=25;
            explanations.push("Domain is very new (<30 days)");
          }else if(domainAgeDays<180){
            risk+=10;
            explanations.push("Domain is relatively new");
          }
        }
      }
    }catch{
      explanations.push("Could not fetch domain age");
    }

    // ⭐ FETCH PAGE (v3)
    try{
      const response = await axios.get(targetUrl,{
        maxRedirects:5,
        validateStatus:()=>true,
        timeout:5000
      });

      redirectCount=response.request?._redirectable?._redirectCount||0;

      const $=cheerio.load(response.data||"");

      if($('input[type="password"]').length>0){
        risk+=25;
        explanations.push("Login form detected");
      }

      const text=$("body").text().toLowerCase();

      if(text.includes("verify your account")||text.includes("sign in")){
        risk+=15;
        explanations.push("Credential harvesting wording");
      }

    }catch{
      explanations.push("Could not fetch page content");
    }

    if(redirectCount>2){
      risk+=15;
      explanations.push("Multiple redirects detected");
    }

    const status =
      risk<30?"Low risk":
      risk<60?"Medium risk":
      "High risk";

    res.json({
      risk,
      status,
      explanations,
      details:{
        domain,
        tld,
        https:targetUrl.startsWith("https")?"yes":"no",
        domain_age_days:domainAgeDays??"unknown",
        redirects:redirectCount
      }
    });

  } catch {
    res.status(400).json({ error: "invalid url" });
  }
});

app.get("/",(req,res)=>{
  res.send("CyberLab backend running");
});

app.use((err,req,res,next)=>{
  console.error(err);
  res.status(500).json({error:"Internal server error"});
});

app.listen(5000,()=>{
  console.log("Server running on http://localhost:5000");
});
