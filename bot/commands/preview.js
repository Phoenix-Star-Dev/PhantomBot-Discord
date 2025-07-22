const { Connection, PublicKey } = require("@solana/web3.js");
const { getWallet } = require("../../db");
const LAMPORTS_PER_SOL = 1000000000;
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

    // Example: Fetch account info
    const connection = new Connection(process.env.SOLANA_RPC);
    const accountInfo = await connection.getAccountInfo(
      new PublicKey(userPublicKey)
    );

    await interaction.reply({
      content: `🖼 Transaction Preview:
- Your Wallet: \`${userPublicKey}\`
- Balance: ◎${accountInfo.lamports / LAMPORTS_PER_SOL}
- Last Activity: ${new Date(accountInfo.rentEpoch * 1000).toLocaleString()}`,
      ephemeral: true,
    });
  },
};
