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
  const target = req.query.url

  if (!target) return res.status(400).json({ error: "no url" })

  const result = calculateRisk(target)

  res.json(result)
})

app.get("/", (req,res)=>{
  res.send("CyberLab backend running")
})

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})
