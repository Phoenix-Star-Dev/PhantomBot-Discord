const { createBundle, sendBundle } = require("../../solana/bundler");
const { getWallet } = require("../../db");

module.exports = {
  async execute(interaction) {
    // For demo: Assume we bundle a simple SOL transfer or NFT mint (later: parse user input)
    const discordId = interaction.user.id;
    const userPublicKey = await getWallet(discordId);

    if (!userPublicKey) {
      return await interaction.reply({
        content: "❌ You need to /connect your Phantom wallet first.",
        ephemeral: true,
      });
    }

    await interaction.reply("📦 Bundling your transactions (demo)...");

    // TODO: Build transactions array here (NFT mint or SPL transfer)
    // For now, just simulate success
    setTimeout(() => {
      interaction.followUp("✅ Bundle sent successfully! (demo)");
    }, 3000);
  },
};
