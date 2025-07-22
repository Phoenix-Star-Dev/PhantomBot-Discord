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
    // Defer reply to avoid timeout
    await interaction.deferReply({ ephemeral: true });

    try {
      // Get user inputs
      const recipientAddress = interaction.options.getString("recipient");
      const solAmount = interaction.options.getNumber("amount");

      // Validate amount
      if (solAmount <= 0) {
        return interaction.editReply("❌ Amount must be greater than 0");
      }

      // Convert to lamports
      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      // Validate recipient address
      let recipientPublicKey;
      try {
        recipientPublicKey = new PublicKey(recipientAddress);
      } catch (e) {
        return interaction.editReply("❌ Invalid recipient address");
      }

      // Get sender's wallet from DB
      const senderAddress = await getWallet(interaction.user.id);
      if (!senderAddress) {
        return interaction.editReply(
          "❌ Connect your wallet first with `/connect`"
        );
      }
      const senderPublicKey = new PublicKey(senderAddress);

      // Create transaction
      const connection = new Connection(process.env.SOLANA_RPC);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: lamports,
        })
      );

      // Get fee estimate
      const { blockhash, feeCalculator } =
        await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      const fee = feeCalculator.lamportsPerSignature;

      // Send confirmation
      await interaction.editReply({
        content: `📦 Transaction Bundle Ready:
• From: \`${senderPublicKey.toString().slice(0, 8)}...\`
• To: \`${recipientPublicKey.toString().slice(0, 8)}...\`
• Amount: ◎${solAmount.toFixed(4)}
• Estimated Fee: ◎${(fee / LAMPORTS_PER_SOL).toFixed(4)}`,
      });
    } catch (error) {
      console.error("Bundle Error:", error);
      await interaction.editReply("⚠️ Failed to create transaction bundle");
    }
  },
};
