const {
  Connection,
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const { MessageFlags } = require("discord.js");
const { getWallet } = require("../../db");

module.exports = {
  async execute(interaction) {
    try {
      // Defer first to avoid timeout
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const discordId = interaction.user.id;
      const walletAddress = await getWallet(discordId);

      if (!walletAddress) {
        return interaction.editReply({
          content: "❌ Connect your wallet first with `/connect`",
        });
      }

      // Validate public key
      let senderPublicKey;
      try {
        senderPublicKey = new PublicKey(walletAddress);
      } catch (e) {
        return interaction.editReply({
          content: "❌ Invalid wallet format. Please reconnect with `/connect`",
        });
      }

      const connection = new Connection(process.env.SOLANA_RPC);
      const recipient = new PublicKey("RECIPIENT_PUBLIC_KEY_HERE"); // Replace with actual

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipient,
          lamports: 1000000, // 0.001 SOL
        })
      );

      // Get recent blockhash
      const { blockhash, feeCalculator } =
        await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      const fee = feeCalculator.lamportsPerSignature;

      // Format response
      await interaction.editReply({
        content: `📦 Transaction Bundle Created:
• From: \`${senderPublicKey}\`
• To: \`${recipient}\`
• Amount: ◎${(1000000 / LAMPORTS_PER_SOL).toFixed(4)}
• Fee: ◎${(fee / LAMPORTS_PER_SOL).toFixed(4)}`,
      });
    } catch (error) {
      console.error("Bundle Command Error:", error);
      try {
        await interaction.editReply({
          content: "⚠️ Failed to create transaction bundle",
        });
      } catch (editError) {
        console.error("Failed to send error:", editError);
      }
    }
  },
};
