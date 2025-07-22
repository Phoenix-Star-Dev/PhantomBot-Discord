require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const commands = require("./commands/index");
const path = require("path");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

client.login(process.env.DISCORD_TOKEN);

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

// In your main bot index.js
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.isModalSubmit() && interaction.customId === "bundleModal") {
    require("./commands/bundle").handleModal(interaction);
  }

  if (interaction.isButton()) {
    if (interaction.customId === "confirmBundle") {
      // Handle transaction confirmation
      await interaction.update({
        content: "✅ Transaction submitted!",
        components: [],
      });
      // Add your transaction signing logic here
    } else if (interaction.customId === "cancelBundle") {
      await interaction.update({
        content: "❌ Transaction cancelled",
        components: [],
      });
    }
  }

  try {
    const command = require(`./commands/${interaction.commandName}.js`);
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    // Check if already replied
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "⚠️ There was an error executing this command.",
        ephemeral: true,
      });
    } else {
      // If already replied, try editing
      try {
        await interaction.editReply({
          content: "⚠️ There was an error executing this command.",
        });
      } catch (editError) {
        console.error("EditReply failed:", editError);
      }
    }
  }
});

client.on("interactionCreate", async (interaction) => {});
