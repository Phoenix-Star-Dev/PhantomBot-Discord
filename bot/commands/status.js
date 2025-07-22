const { Connection, PublicKey } = require("@solana/web3.js");
const { getWallet } = require("../../db");

module.exports = {
  async execute(interaction) {
    const discordId = interaction.user.id;
    const userPublicKey = await getWallet(discordId);

    if (!userPublicKey) {
      return interaction.reply({
        content: "❌ Connect your wallet first with `/connect`",
        ephemeral: true,
      });
    }

    // Example: Check transaction history
    const connection = new Connection(process.env.SOLANA_RPC);
    const signatures = await connection.getConfirmedSignaturesForAddress2(
      new PublicKey(userPublicKey),
      { limit: 5 }
    );

    const statusMessage =
      signatures
        .map((sig) => `- TX: \`${sig.signature}\` (Slot: ${sig.slot})`)
        .join("\n") || "No recent transactions found";

    await interaction.reply({
      content: `⏳ Transaction History for \`${userPublicKey}\`:\n${statusMessage}`,
      ephemeral: true,
    });
  },
};
