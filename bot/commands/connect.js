const { getWallet } = require("../../db");
const { publicKey: dappEncryptionPublicKey } = require("../../phantomKeyPair");

module.exports = {
  async execute(interaction) {
    const discordId = interaction.user.id;
    const existingPublicKey = await getWallet(discordId);

    if (existingPublicKey) {
      return interaction.reply({
        content: `🔗 Already connected: \`${existingPublicKey}\``,
        ephemeral: true,
      });
    }

    const connectUrl = `${process.env.SERVER_URL}/phantom/auto-connect?discord_id=${discordId}`;

    await interaction.reply({
      content: `Connecting wallet...`,
      ephemeral: true,
    });

    // This will open in a new tab automatically in most browsers
    interaction.followUp({
      content: `[Complete connection](${connectUrl})`,
      ephemeral: true,
    });
  },
};
