const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const { getWallet } = require("../../db");

module.exports = {
  async execute(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId("bundleModal")
        .setTitle("Create Transaction Bundle");

      // Recipient field (note the custom ID)
      const recipientInput = new TextInputBuilder()
        .setCustomId("recipientAddress") // Changed to match handler
        .setLabel("Recipient Solana Address")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(44);

      // Amount field (note the custom ID)
      const amountInput = new TextInputBuilder()
        .setCustomId("solAmount") // Changed to match handler
        .setLabel("Amount (SOL)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder("0.1");

      const firstActionRow = new ActionRowBuilder().addComponents(
        recipientInput
      );
      const secondActionRow = new ActionRowBuilder().addComponents(amountInput);

      modal.addComponents(firstActionRow, secondActionRow);
      await interaction.showModal(modal);
    } catch (error) {
      console.error("Modal error:", error);
      await interaction.reply({
        content: "Failed to open transaction form",
        ephemeral: true,
      });
    }
  },

  async handleModal(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Now these match the modal's custom IDs
      const recipientAddress =
        interaction.fields.getTextInputValue("recipientAddress");
      const solAmount = parseFloat(
        interaction.fields.getTextInputValue("solAmount")
      );

      // Rest of your validation logic...
      const recipient = new PublicKey(recipientAddress);
      if (isNaN(solAmount)) throw new Error("Invalid amount");

      const lamports = solAmount * LAMPORTS_PER_SOL;
      const sender = new PublicKey(await getWallet(interaction.user.id));

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
        content: `⚠️ Confirm sending ◎${solAmount} to \`${recipient
          .toString()
          .slice(0, 8)}...\``,
        components: [confirmRow],
      });
    } catch (error) {
      await interaction.editReply({
        content: `❌ Error: ${
          error.message.includes("invalid public key")
            ? "Invalid wallet address"
            : "Please enter a valid amount"
        }`,
      });
    }
  },
};
