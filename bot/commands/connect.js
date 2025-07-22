const { getWallet } = require("../../db");
const { publicKey: dappEncryptionPublicKey } = require("../../phantomKeyPair");
const querystring = require("querystring");

const APP_URL = process.env.SERVER_URL;
const PHANTOM_CONNECT_BASE = "https://phantom.app/ul/v1/connect";
const SERVER_URL = process.env.SERVER_URL; // Add this to your .env

module.exports = {
  async execute(interaction) {
    const discordId = interaction.user.id;
    const existingPublicKey = await getWallet(discordId);

    if (existingPublicKey) {
      await interaction.reply({
        content: `🔗 You're already connected with wallet: \`${existingPublicKey}\``,
        ephemeral: true,
      });
      return;
    }

    // Detect if user is on mobile or desktop
    const isMobile = false; // Default to desktop for web browser
    const callbackUrl = `${process.env.PHANTOM_CALLBACK_URL}?discord_id=${discordId}`;

    if (isMobile) {
      // Mobile flow
      const query = {
        app_url: APP_URL,
        dapp_encryption_public_key: dappEncryptionPublicKey,
        redirect_link: callbackUrl,
        cluster: "mainnet-beta",
      };
      const deepLink = `${PHANTOM_CONNECT_BASE}?${querystring.stringify(
        query
      )}`;

      await interaction.reply({
        content: `📱 Mobile: Tap to connect: [Connect Wallet](${deepLink})`,
        ephemeral: true,
      });
    } else {
      // Desktop flow
      const desktopUrl = `${SERVER_URL}/phantom/connect-page?discord_id=${discordId}`;

      await interaction.reply({
        content: `💻 Desktop: Visit this link in your browser: [Connect Wallet](${desktopUrl})\nThen click 'Connect' in the Phantom popup`,
        ephemeral: true,
      });
    }
  },
};
