const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const Sequelize = require('sequelize');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'babdb.sqlite',
});

const userdb = sequelize.define('user', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
});
const diapStash = sequelize.define('diaperstash', {
	name: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	brand: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	quantity: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, readyClient => {
	userdb.sync();
	diapStash.sync();
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const commandName = interaction.client.commands.get(interaction.commandName);

	if (commandName === 'register') {
		await commandName.execute(interaction);
	}
	if (!commandName) {
		console.error(`No command matching ${interaction.commandName} was found.`);
	}
	try {
		await commandName.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
client.login(token);