const {
  Connection,
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
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
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(userPublicKey),
          toPubkey: new PublicKey("RECIPIENT_PUBLIC_KEY"), // Replace with actual recipient
          lamports: 1000000, // 0.001 SOL
        })
      );

      const { blockhash, feeCalculator } =
        await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      const fee = feeCalculator.lamportsPerSignature;

      await interaction.reply({
        content: `📦 Created transaction bundle:
- From: \`${userPublicKey}\`
- To: \`RECIPIENT_PUBLIC_KEY\`
- Amount: ◎${(1000000 / LAMPORTS_PER_SOL).toFixed(4)}
- Network Fee: ◎${(fee / LAMPORTS_PER_SOL).toFixed(4)}
- Status: Ready to sign`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "⚠️ Failed to create transaction bundle",
        ephemeral: true,
      });
    }
  },
};
