require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const commands = require("./commands/index");
const path = require("path");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

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
    console.log("Slash commands registered!");
  } catch (err) {
    console.error(err);
  }
})();

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName;
  try {
    const command = require(path.resolve(
      __dirname,
      "commands",
      `${commandName}.js`
    ));
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "⚠️ There was an error executing this command.",
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
