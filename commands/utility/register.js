const { SlashCommandBuilder } = require('discord.js');
const database = require('../../database.js');
const wait = require('node:timers/promises').setTimeout;

/*
const userdb = sequelize.define('user', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
});
*/
module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		const user = await database.userdb.findOne({ where: { name: interaction.user.username } });
		if (user) {
			await interaction.reply({ content: 'Oops! Looks like you\'re already registered, kiddo!', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'Welcome to the Nursery, kiddo! One moment while I get your name written down...', ephemeral: true });
			await wait(3_000);
			await database.userdb.create({
				name: interaction.user.username,
			});
			await interaction.followUp({ content: 'All done! You\'re now registered!', ephemeral: true });
		}
	},
};