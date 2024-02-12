const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType, EmbedBuilder } = require('discord.js');
const database = require('../../database.js');
const Sequelize = require('sequelize');
const stringLibrary = require('../../config/stringLibrary.json');
const wait = require('node:timers/promises').setTimeout;
module.exports = {
	data: new SlashCommandBuilder()
	// TODO: User should be prompted with a teasy survey about their diaper change.  Determine user's current diaper status prior to the change.
	// If possible, prompt the user for what brand they're changing into.  Then update all statuses to Clean.
	// Each diaper change should be logged in the database as its own row.  diapStatus can be used to track the current diaper status and the last time it was updated without needing new rows added.
	// Later, we can pull the diaper change history from the database and display it in a nice format, as well as allow users to change each other.
		.setName('change')
		.setDescription('Changes the diaper of the user.'),
	async execute(interaction) {




		/*
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
			*/
		const confirmButton = new ButtonBuilder()
			.setCustomId('confirmButton')
			.setLabel('Confirm Change')
			.setStyle(ButtonStyle.Success);
		const cancelButton = new ButtonBuilder()
			.setCustomId('cancelButton')
			.setLabel('Cancel Change')
			.setStyle(ButtonStyle.Danger);


		const row2 = new ActionRowBuilder()
			.addComponents(
				wetMenu,
			);
		const row3 = new ActionRowBuilder()
			.addComponents(
				messyMenu,
			);
		const row5 = new ActionRowBuilder()
			.addComponents(
				confirmButton,
				cancelButton,
			);


		const wetFilter = i => {
			return i.customId === 'wetMenu' && i.user.id === interaction.user.id;
		};
		const messyFilter = i => {
			return i.customId === 'messyMenu' && i.user.id === interaction.user.id;
		};
		const confirmFilter = i => {
			return i.customId === 'confirmButton' && i.user.id === interaction.user.id;
		};

		await brandCollector.update({ embeds: [brandEmbed], components: [row1] });
		const wetEmbed = new EmbedBuilder()
			.setDescription(
				`That's a good choice! _he says as he pulls out the ${brandCollector.values[0]} from the bag_ \n` + '_Ralsei sticks a finger in your legband and checks your diaper for wetness._')
			.setColor('#f3ff88')
			.setImage('https://i.imgur.com/JJ4KxbS.png');
		await brandCollector.update({ embeds: [wetEmbed], components: [row2] });
		const wetCollector = await response.awaitMessageComponent({ filter: wetFilter, time: 60_000 });
		const messyEmbed = new EmbedBuilder()
			.setTitle(stringLibrary.Characters.Ralsei.Change.General.title)
			.setDescription(stringLibrary.Characters.Ralsei.Change.Wet[wetCollector.values[0]] + '\n\n' + stringLibrary.Characters.Ralsei.Change.Messy.title)
			.setColor('#ca773f')
			.setImage('https://i.imgur.com/JJ4KxbS.png');
		await wetCollector.update({ embeds: [messyEmbed], components: [row3] });
		const messyCollector = await response.awaitMessageComponent({ filter: messyFilter, time: 60_000 });
		const confirmEmbed = new EmbedBuilder()
			.setTitle(stringLibrary.Characters.Ralsei.Change.General.title)
			.setDescription(stringLibrary.Characters.Ralsei.Change.Messy[messyCollector.values[0]] + '\n\n\n' + stringLibrary.Characters.Ralsei.Change.General.changeConfirm)
			.setColor('#9ae7ff')
			.setImage('https://i.imgur.com/JJ4KxbS.png');
		await messyCollector.update({ embeds: [confirmEmbed], components: [row5] });
		const confirmCollector = await response.awaitMessageComponent({ filter: confirmFilter, time: 60_000 });
		const changeEmbed = new EmbedBuilder()
			.setTitle(stringLibrary.Characters.Ralsei.Change.General.title)
			.setDescription(stringLibrary.Characters.Ralsei.Change.General.change)
			.setColor('#9ae7ff')
			.setImage('https://i.imgur.com/JJ4KxbS.png');
		const changeEndEmbed = new EmbedBuilder()
			.setTitle(stringLibrary.Characters.Ralsei.Change.General.title)
			.setDescription(stringLibrary.Characters.Ralsei.Change.General.changeEnd)
			.setColor('#9ae7ff')
			.setImage('https://i.imgur.com/JJ4KxbS.png');
		await confirmCollector.update({ embeds: [changeEmbed], components: [] });
		await wait(3_000);
		await response.edit({ embeds: [changeEndEmbed], components: [] });
		try {
			if (confirmCollector.customId === 'confirmButton') {
				const currentDiap = await database.diapStatus.findOne({ attributes: ['brand'] }, { where: { name: interaction.user.username } });
				await database.diapChangeTracker.create({
					name: interaction.user.username,
					previousBrand: currentDiap,
					brand: brandCollector.values[0],
					print: printCollector.values[0],
					wet: wetCollector.values[0],
					messy: messyCollector.values[0],
					changetime: new Date(),
				});

				await database.diapStatus.update({
					brand: brandCollector.values[0],
					print: printCollector.values[0],
					wet: 'Dry',
					messy: 'Clean',
					lastChange: new Date(),
					lastUpdated: new Date(),
				}, { where: { name: interaction.user.username } });

				await database.diapStash.decrement({ 'quantity': 1 }, { where: { name: interaction.user.username, brand: selectCollector.values[0] } });
			}
		}
		catch (e) {
			console.log(e);
			return interaction.reply({ content: 'You didn\'t select an option in time!' });
		}
	},
};