require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const commands = require("./commands");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// Register slash commands
(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log("Slash commands registered.");
  } catch (err) {
    console.error(err);
  }
})();

client.once("ready", () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  try {
    const handler = require(`./commands/${commandName}`);
    await handler.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "⚠️ Error handling command",
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
