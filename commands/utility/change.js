const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const { database } = require('../../database.js');

module.exports = {
	data: new SlashCommandBuilder()
	// TODO: User should be prompted with a teasy survey about their diaper change.  Determine user's current diaper status prior to the change.
	// If possible, prompt the user for what brand they're changing into.  Then update all statuses to Clean.
	// Each diaper change should be logged in the database as its own row.  diapStatus can be used to track the current diaper status and the last time it was updated without needing new rows added.
	// Later, we can pull the diaper change history from the database and display it in a nice format, as well as allow users to change each other.
		.setName('change')
		.setDescription('Changes the diaper of the user.'),

	async execute(interaction) {
		const brandMenu = new StringSelectMenuBuilder()
			.setCustomId('brandMenu')
			.setPlaceholder('Select a brand')
		// TODO: Query the user's diaper stash and add only the brands they have to the menu.
		// TODO: Break out valueToName from diapers.js into its own file and import it here.
			.addOptions(
				// Can we use a for loop to add all the brands to the menu?
				new StringSelectMenuOptionBuilder()
					.setLabel('PeekABU')
					.setValue('PeekABU'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Space')
					.setValue('Space'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Simple')
					.setValue('Simple'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Super Dry Kids')
					.setValue('SDK'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Little Pawz')
					.setValue('Little Pawz'),
				new StringSelectMenuOptionBuilder()
					.setLabel('PreSchool')
					.setValue('PreSchool'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Cushies')
					.setValue('Cushies'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Overnights')
					.setValue('Overnights'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Cammies')
					.setValue('Cammies'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Galactic')
					.setValue('Galactic'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Unicorn')
					.setValue('Unicorn'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Little Rawrs')
					.setValue('Little Rawrs'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Trest Elites')
					.setValue('Trest Elites'),
			);
		const wetMenu = new StringSelectMenuBuilder()
			.setCustomId('wetMenu')
			.setPlaceholder('Select wetness')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Dry')
					.setValue('Dry'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Damp')
					.setValue('Damp'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Wet')
					.setValue('Wet'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Soaked')
					.setValue('Soaked'),
			);
		const messyMenu = new StringSelectMenuBuilder()
			.setCustomId('messyMenu')
			.setPlaceholder('Select messiness')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Clean')
					.setValue('Clean'),
				new StringSelectMenuOptionBuilder()
					.setLabel('A little messy')
					.setValue('littleMessy'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Kinda messy')
					.setValue('kindaMessy'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Very messy')
					.setValue('veryMessy'),
			);
		const stickyMenu = new StringSelectMenuBuilder()
			.setCustomId('stickyMenu')
			.setPlaceholder('Select stickiness')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('No')
					.setValue('False'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Yes')
					.setValue('True'),
			);
		const row1 = new ActionRowBuilder()
			.addComponents(
				brandMenu,
			);
		const row2 = new ActionRowBuilder()
			.addComponents(
				wetMenu,
			);
		const row3 = new ActionRowBuilder()
			.addComponents(
				messyMenu,
			);
		const row4 = new ActionRowBuilder()
			.addComponents(
				stickyMenu,
			);
		const user = database.userdb.findOne({ where: { name: interaction.user.username } });
		await interaction.reply({

			content: 'Uh oh!  Looks like you need a diaper change!  Let\'s get you changed!',
			components: [row1, row2, row3, row4],
			ephemeral: true });
	},
};