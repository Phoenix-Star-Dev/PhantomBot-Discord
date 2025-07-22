const { previewBundle } = require("../../solana/preview");

module.exports = {
  async execute(interaction) {
    await interaction.reply(
      "🖼 Here’s your transaction bundle preview... (simulated)"
    );
  },
};
