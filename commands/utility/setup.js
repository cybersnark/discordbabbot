const { SlashCommandBuilder } = require('discord.js');
const Sequelize = require('sequelize');
const database = require('../../database.js');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	freezetableName: true,
	logging: false,
	// SQLite only
	storage: 'babdb.sqlite',
});


module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Sets up the database tables.'),
	async execute(interaction) {
		/* const brands = ['PeekABU', 'Space', 'Simple', 'Super Dry Kids', 'Little Pawz', 'PreSchool', 'Cushies', 'BunnyHopps', 'DinoRawrZ', 'Little Kings', 'AlphaGatorz', 'Kiddo', 'Tiny Tails', 'Overnights', 'Cammies', 'Galactic', 'Unicorn', 'Little Rawrs', 'Waddler', 'Puppers', 'Animooz', 'Camelot', 'Str8up', 'Trest Elite', 'Classico', 'Bianco', 'Magnifico', 'Bellissimo', 'Safari', 'Princess Pink'];
		const brandPlural = ['PeekABUs', 'Spaces', 'Simples', 'Super Dry Kids', 'Little Pawz', 'PreSchools', 'Cushies', 'BunnyHopps', 'DinoRawrZ', 'Little Kings', 'AlphaGatorz', 'Kiddos', 'Tiny Tails', 'Overnights', 'Cammies', 'Galactics', 'Unicorns', 'Little Rawrs', 'Waddlers', 'Puppers', 'Animooz', 'Camelots', 'Str8ups', 'Trest Elites', 'Classicos', 'Biancos', 'Magnificos', 'Bellissimos', 'Safaris', 'Princess Pinks'];
		sequelize.sync();
		for (const brand of brands) {
			database.brandList.create({
				brand: brand,
				pluralName: brandPlural[brand],
			});
		}
		database.brandList.sync();
        */

		database.doSetup();
		await interaction.reply({ content: 'Databases synced!', ephemeral: true });
	},
};