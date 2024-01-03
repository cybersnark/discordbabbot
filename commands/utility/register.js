const { SlashCommandBuilder } = require('discord.js');
const Sequelize = require('sequelize');
const wait = require('node:timers/promises').setTimeout;

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
		unique: true,
	},
	// ABUniverse Brands
	space: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	littlePawz: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	simple: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	sdk: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	preSchool: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	cushies: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	peekABU: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	// Tykables Brands
	overnights: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	cammies: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	galactic: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	littleBuilders: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	unicorn: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	littleRawrs: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	trestElites: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},

});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		const user = await userdb.findOne({ where: { name: interaction.user.username } });
		if (user) {
			await interaction.reply({ content: 'Oops! Looks like you\'re already registered, kiddo!', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'Welcome to the Nursery, kiddo! One moment while I get your name written down...', ephemeral: true });
			await wait(3_000);
			await userdb.create({
				name: interaction.user.username,
			});
			await diapStash.create({
				name: interaction.user.username,
			});
			await interaction.followUp({ content: 'All done! You\'re now registered!', ephemeral: true });
		}
	},
};