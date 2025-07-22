const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const {
  PublicKey,
  LAMPORTS_PER_SOL,
  Connection,
  SystemProgram,
} = require("@solana/web3.js");
const { getWallet } = require("../../db");

// Constants
const MAX_SOL_AMOUNT = 10;
const MIN_SOL_AMOUNT = 0.001;

module.exports = {
  async execute(interaction) {
    try {
      // Verify wallet connection first
      const wallet = await getWallet(interaction.user.id);
      if (!wallet) {
        return await interaction.reply({
          content: "❌ Please connect your wallet with `/connect` first",
          ephemeral: true,
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("bundleModal")
        .setTitle("Create Transaction Bundle");

      const recipientInput = new TextInputBuilder()
        .setCustomId("recipientAddress")
        .setLabel("Recipient Solana Address")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(44)
        .setPlaceholder("Eg: 5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM");

      const amountInput = new TextInputBuilder()
        .setCustomId("solAmount")
        .setLabel(`Amount (SOL) - Max ${MAX_SOL_AMOUNT} SOL`)
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder(`0.1 - ${MAX_SOL_AMOUNT}`);

      modal.addComponents(
        new ActionRowBuilder().addComponents(recipientInput),
        new ActionRowBuilder().addComponents(amountInput)
      );

      await interaction.showModal(modal);
    } catch (error) {
      console.error("Modal Initialization Error:", error);
      await interaction.reply({
        content:
          "🔧 Failed to initialize transaction form. Please try again later.",
        ephemeral: true,
      });
    }
  },

  async handleModal(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      // 1. Validate and parse inputs
      const recipientAddress = interaction.fields
        .getTextInputValue("recipientAddress")
        .trim();
      const solAmount = parseFloat(
        interaction.fields.getTextInputValue("solAmount").replace(/,/g, "")
      );

      if (isNaN(solAmount) || !isFinite(solAmount)) {
        throw new Error("INVALID_AMOUNT");
      }

      if (solAmount < MIN_SOL_AMOUNT) {
        throw new Error("AMOUNT_TOO_SMALL");
      }

      if (solAmount > MAX_SOL_AMOUNT) {
        throw new Error("AMOUNT_TOO_LARGE");
      }

      // 2. Validate wallet addresses
      let recipient, sender;
      try {
        recipient = new PublicKey(recipientAddress);
        sender = new PublicKey(await getWallet(interaction.user.id));
      } catch (e) {
        throw new Error("INVALID_ADDRESS");
      }

      // 3. Check if sending to self
      if (recipient.equals(sender)) {
        throw new Error("SELF_TRANSFER");
      }

      // 4. Prepare transaction
      const connection = new Connection(process.env.SOLANA_RPC);
      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      const { blockhash, feeCalculator } =
        await connection.getRecentBlockhash();
      const fee = feeCalculator.lamportsPerSignature;

      // 5. Create confirmation embed
      const confirmEmbed = new EmbedBuilder()
        .setTitle("⚠️ Confirm Transaction")
        .addFields(
          {
            name: "From",
            value: `\`${sender.toString().slice(0, 8)}...\``,
            inline: true,
          },
          {
            name: "To",
            value: `\`${recipient.toString().slice(0, 8)}...\``,
            inline: true,
          },
          { name: "Amount", value: `◎${solAmount.toFixed(4)}`, inline: true },
          {
            name: "Network Fee",
            value: `◎${(fee / LAMPORTS_PER_SOL).toFixed(4)}`,
            inline: true,
          }
        )
        .setColor(0xf5a623);

      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirmBundle")
          .setLabel("Confirm")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("cancelBundle")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.editReply({
        embeds: [confirmEmbed],
        components: [confirmRow],
      });
    } catch (error) {
      console.error("Transaction Setup Error:", error.message);

      const errorMessages = {
        INVALID_ADDRESS: `❌ Invalid Solana address provided`,
        INVALID_AMOUNT: `❌ Please enter a valid number for amount`,
        AMOUNT_TOO_SMALL: `❌ Minimum transfer is ◎${MIN_SOL_AMOUNT}`,
        AMOUNT_TOO_LARGE: `❌ Maximum transfer is ◎${MAX_SOL_AMOUNT}`,
        SELF_TRANSFER: `❌ Cannot send to yourself`,
        DEFAULT: `⚠️ Transaction failed: ${error.message}`,
      };

      await interaction.editReply({
        content: errorMessages[error.message] || errorMessages["DEFAULT"],
        components: [],
      });
    }
  },

  async handleConfirmation(interaction) {
    try {
      await interaction.deferUpdate();

      // Add your actual transaction signing and submission logic here
      // This would involve:
      // 1. Getting the transaction details
      // 2. Signing with the user's wallet
      // 3. Sending to the network
      // 4. Reporting status

      await interaction.editReply({
        content: "✅ Transaction submitted successfully!",
        embeds: [],
        components: [],
      });
    } catch (error) {
      console.error("Transaction Execution Error:", error);
      await interaction.editReply({
        content: `❌ Failed to execute transaction: ${error.message}`,
        embeds: [],
        components: [],
      });
    }
  },
};
