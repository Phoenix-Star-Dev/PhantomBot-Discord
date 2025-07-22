const express = require("express");
const { saveWallet } = require("../db");
require("dotenv").config();

const app = express();

app.get("/phantom/callback", async (req, res) => {
  const { discord_id, public_key } = req.query;

  if (!discord_id || !public_key) {
    return res.status(400).send("Missing parameters");
  }

  try {
    await saveWallet(discord_id, public_key);
    res.send("✅ Wallet connected! You can return to Discord.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving wallet");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Phantom callback server running on port ${PORT}`);
});
