const { getWallet } = require("../../db");
const { publicKey: dappEncryptionPublicKey } = require("../../phantomKeyPair");
const querystring = require("querystring");

const APP_URL = process.env.SERVER_URL; // Your app metadata URL (can be your website)
const PHANTOM_CONNECT_BASE = "https://phantom.app/ul/v1/connect";

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

    // Build the query parameters according to Phantom docs:
    const query = {
      app_url: APP_URL,
      dapp_encryption_public_key: dappEncryptionPublicKey,
      redirect_link: `${process.env.PHANTOM_CALLBACK_URL}?discord_id=${discordId}`,
      cluster: "mainnet-beta", // or 'devnet', 'testnet'
    };

    const deepLink = `${PHANTOM_CONNECT_BASE}?${querystring.stringify(query)}`;

    await interaction.reply({
      content: `🔗 Connect your Phantom Wallet: [Connect Wallet](${deepLink})`,
      ephemeral: true,
    });
  },
};
