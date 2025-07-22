const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function saveWallet(discordId, publicKey) {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      { discord_id: discordId, public_key: publicKey },
      { onConflict: "discord_id" }
    );

  if (error) {
    console.error("❌ Supabase error:", error);
    throw error;
  }

  console.log(`🔑 Saved wallet for Discord ID ${discordId}`);
  return data;
}

async function getWallet(discordId) {
  const { data, error } = await supabase
    .from("users")
    .select("public_key")
    .eq("discord_id", discordId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("❌ Supabase error:", error);
    throw error;
  }

  return data ? data.public_key : null;
}

module.exports = { saveWallet, getWallet };
