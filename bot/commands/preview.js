const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");
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
      const publicKey = new PublicKey(userPublicKey);
      const balance = await connection.getBalance(publicKey);
      const accountInfo = await connection.getAccountInfo(publicKey);

      await interaction.reply({
        content: `🖼 Wallet Preview:
- Address: \`${userPublicKey}\`
- Balance: ◎${(balance / LAMPORTS_PER_SOL).toFixed(4)}
- Executable: ${accountInfo?.executable ? "Yes" : "No"}
- Owner: \`${accountInfo?.owner.toString()}\``,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "⚠️ Failed to fetch wallet info",
        ephemeral: true,
      });
    }
  },
};
