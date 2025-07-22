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

    try {
      const connection = new Connection(process.env.SOLANA_RPC);
      const signatures = await connection.getConfirmedSignaturesForAddress2(
        new PublicKey(userPublicKey),
        { limit: 3 }
      );

      const statusMessage =
        signatures.length > 0
          ? signatures
              .map(
                (sig, i) =>
                  `${i + 1}. [${sig.signature.slice(0, 6)}...] (Slot: ${
                    sig.slot
                  })`
              )
              .join("\n")
          : "No recent transactions found";

      await interaction.reply({
        content: `⏳ Transaction Status for \`${userPublicKey.slice(0, 6)}...\`:
${statusMessage}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "⚠️ Failed to fetch transaction history",
        ephemeral: true,
      });
    }
  },
};
