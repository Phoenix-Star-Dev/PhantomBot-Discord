const { Connection, Transaction, SystemProgram } = require("@solana/web3.js");
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

    // Example: Create a simple SOL transfer transaction
    const connection = new Connection(process.env.SOLANA_RPC);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(userPublicKey),
        toPubkey: new PublicKey("RECIPIENT_PUBLIC_KEY"), // Replace with actual recipient
        lamports: 1000000, // 0.001 SOL
      })
    );

    // Get recent blockhash and fee
    const { blockhash, feeCalculator } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    const fee = feeCalculator.lamportsPerSignature;

    await interaction.reply({
      content: `📦 Created transaction bundle:
- From: \`${userPublicKey}\`
- Network Fee: ◎${fee / LAMPORTS_PER_SOL}
- Status: Ready to sign`,
      ephemeral: true,
    });
  },
};
