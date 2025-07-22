const { getWallet } = require("../../db");
const PHANTOM_BASE_URL = "https://phantom.app/ul/v1/connect";

module.exports = {
  async execute(interaction) {
    const discordId = interaction.user.id;
    const publicKey = await getWallet(discordId);

    if (publicKey) {
      await interaction.reply({
        content: `🔗 You’re already connected: \`${publicKey}\``,
        ephemeral: true,
      });
    } else {
      const callbackUrl = encodeURIComponent(
        process.env.PHANTOM_CALLBACK_URL + "?discord_id=" + discordId
      );
      const deepLink = `${PHANTOM_BASE_URL}?redirect=${callbackUrl}`;

      await interaction.reply({
        content: `🔗 Connect your Phantom Wallet: [Connect Wallet](${deepLink})`,
        ephemeral: true,
      });
    }
  },
};
