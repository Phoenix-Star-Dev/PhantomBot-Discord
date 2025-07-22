const { getWallet } = require("../../db");

module.exports = {
  async execute(interaction) {
    const discordId = interaction.user.id;
    const publicKey = await getWallet(discordId);

    if (publicKey) {
      await interaction.reply(`🔗 You’re already connected: \`${publicKey}\``);
    } else {
      const callbackUrl = encodeURIComponent(
        `https://your-server.com/phantom/callback?discord_id=${discordId}`
      );
      const deepLink = `https://phantom.app/ul/v1/connect?redirect=${callbackUrl}`;

      await interaction.reply({
        content: `🔗 Connect your Phantom Wallet: [Connect Wallet](${deepLink})`,
        ephemeral: true,
      });
    }
  },
};
