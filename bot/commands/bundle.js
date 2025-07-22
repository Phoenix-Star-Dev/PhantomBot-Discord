const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  async execute(interaction) {
    try {
      // Create the modal
      const modal = new ModalBuilder()
        .setCustomId("bundleModal")
        .setTitle("Create Transaction Bundle");

      // Add components to modal
      const recipientInput = new TextInputBuilder()
        .setCustomId("recipientInput")
        .setLabel("Recipient Solana Address")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(44);

      const amountInput = new TextInputBuilder()
        .setCustomId("amountInput")
        .setLabel("Amount (SOL)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder("0.1");

      // Combine components into action rows
      const firstActionRow = new ActionRowBuilder().addComponents(
        recipientInput
      );
      const secondActionRow = new ActionRowBuilder().addComponents(amountInput);

      // Add action rows to modal
      modal.addComponents(firstActionRow, secondActionRow);

      // Show the modal
      await interaction.showModal(modal);
    } catch (error) {
      console.error("Modal error:", error);
      await interaction.reply({
        content: "Failed to open transaction form",
        ephemeral: true,
      });
    }
  },

  // This handles the modal submission
  async handleModal(interaction) {
    await interaction.deferReply({ ephemeral: true });

    // 1. Get form values
    const recipientAddress =
      interaction.fields.getTextInputValue("recipientAddress");
    const solAmount = parseFloat(
      interaction.fields.getTextInputValue("solAmount")
    );

    try {
      // 2. Validate inputs
      const recipient = new PublicKey(recipientAddress); // Validates address
      if (isNaN(solAmount)) throw new Error("Invalid amount");

      const lamports = solAmount * LAMPORTS_PER_SOL;
      const sender = new PublicKey(await getWallet(interaction.user.id));

      // 3. Create confirmation message with buttons
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
