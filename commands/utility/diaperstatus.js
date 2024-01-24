const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType, EmbedBuilder } = require('discord.js');
const change = require('./change.js');
const stringLibrary = require('../../config/stringLibrary.json');
const characterLogic = require('../../config/characterLogic.js');
const wait = require('node:timers/promises').setTimeout;

// TODO: Allow users to run this command on another user. If the user is not specified, the bot will assume the user is running the command on themselves.
// If run on themselves, the bot will check the user's diaper status and prompt them to change if necessary.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('diapercheck')
		.setDescription('Checks and updates the diaper status of the user.'),
	async execute(interaction) {
		const wetMenu = new StringSelectMenuBuilder()
			.setCustomId('wetMenu')
			.setPlaceholder('How wet is your diaper?')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Dry')
					.setDescription('I\'m still dry!')
					.setValue('Dry'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Damp')
					.setDescription('I\'m a little damp...')
					.setValue('Damp'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Wet')
					.setDescription('I\'m wet!')
					.setValue('Wet'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Soaked')
					.setDescription('I\'m soaked!')
					.setValue('Soaked'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Leaking')
					.setDescription('Oh no!  I\'m leaking!')
					.setValue('Leaking'),
			);
		const messyMenu = new StringSelectMenuBuilder()
			.setCustomId('messyMenu')
			.setPlaceholder('And how messy is your diaper?~')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Clean')
					.setDescription('I\'m still clean!')
					.setValue('Clean'),
				new StringSelectMenuOptionBuilder()
					.setLabel('A little messy')
					.setDescription('I had a tiny accident!')
					.setValue('littleMessy'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Kinda messy')
					.setDescription('I had an accident but it\'s not too bad!')
					.setValue('kindaMessy'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Very messy')
					.setDescription('My diaper is very full!')
					.setValue('veryMessy'),
			);
		const confirmButton = new ButtonBuilder()
			.setCustomId('confirmButton')
			.setLabel('Yes, I need a change!')
			.setStyle(ButtonStyle.Success);
		const cancelButton = new ButtonBuilder()
			.setCustomId('cancelButton')
			.setLabel('No, I\'m fine!')
			.setStyle(ButtonStyle.Danger);

		const wetEmbed = new EmbedBuilder()
			.setTitle('PLACEHOLDER - WET DIAPER QUERY')
			.setDescription(stringLibrary.Characters.Ralsei.Change.Status.Self.Wet.Check)
			.setColor('#ebebeb');
		const messyEmbed = new EmbedBuilder()
			.setTitle('PLACEHOLDER - MESSY DIAPER QUERY')
			.setDescription(stringLibrary.Characters.Ralsei.Change.Status.Self.Messy.Check)
			.setColor('#ebebeb');
		const responseEmbed = new EmbedBuilder()
			.setTitle('PLACEHOLDER - DIAPER CHANGE RESPONSE')
			.setDescription(stringLibrary.Characters.Ralsei.Change.Response)
			.setColor('#ebebeb');

		// TODO: Depending on the selections the user made, the bot will send a message urging for the user to change their diaper.
		// We may be able to establish a "weight" that will determine how urgent the bot will be in asking the user to change their diaper.

		const row1 = new ActionRowBuilder()
			.addComponents(
				wetMenu,
			);
		const row2 = new ActionRowBuilder()
			.addComponents(
				messyMenu,
			);
		const row3 = new ActionRowBuilder()
			.addComponents(
				confirmButton,
				cancelButton,
			);
		const response = await interaction.reply({
			embeds: [wetEmbed],
			components: [row1],
			ephemeral: true });

		const wetFilter = i => {
			return i.customId === 'wetMenu' && i.user.id === interaction.user.id;
		};
		const messyFilter = i => {
			return i.customId === 'messyMenu' && i.user.id === interaction.user.id;
		};
		const changeFilter = i => {
			return (i.customId === 'confirmButton' || i.customId === 'cancelButton') && i.user.id === interaction.user.id;
		};
		//TODO: Add consideration for the user to add a booster
		//If user has a booster, wetness will be reduced by 2 levels

		let wetPriority = 0;
		let messyPriority = 0;
		let shouldChange = false;

		const wetCollector = await response.awaitMessageComponent({ filter: wetFilter, time: 60000 });
		wetPriority = characterLogic.Characters.Ralsei.changeLogic.diaperStatus[wetCollector.values[0]].changePriority;
		responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.Status.Self.Wet[wetCollector.values[0]].text);
		responseEmbed.setImage(stringLibrary.Characters.Ralsei.Change.Status.Self.Wet[wetCollector.values[0]].image);
		await wetCollector.update({ embeds: [responseEmbed, messyEmbed], components: [row2] });

		const messyCollector = await response.awaitMessageComponent({ filter: messyFilter, time: 60000 });
		messyPriority = characterLogic.Characters.Ralsei.changeLogic.diaperStatus[messyCollector.values[0]].changePriority;
		responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.Status.Self.Messy[messyCollector.values[0]].text);
		responseEmbed.setImage(stringLibrary.Characters.Ralsei.Change.Status.Self.Messy[messyCollector.values[0]].image);
		await messyCollector.update({ embeds: [responseEmbed], components: [] });
		await wait (5_000);
		if (wetPriority + messyPriority == 0) {
			responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.Status.Self.NoChange);
			responseEmbed.setImage(stringLibrary.Characters.Ralsei.Change.Status.Self.NoChangeImage);
			shouldChange = false;

		}
		else if (wetPriority + messyPriority > 0 && wetPriority + messyPriority <= 3) {
			responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.Status.Self.changeLowPriority);
			responseEmbed.setImage(stringLibrary.Characters.Ralsei.Change.Status.Self.changeLowImage);
			shouldChange = false;
		}
		else if (wetPriority + messyPriority >= 4 && wetPriority + messyPriority <= 7) {
			responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.Status.Self.changeMediumPriority);
			responseEmbed.setImage(stringLibrary.Characters.Ralsei.Change.Status.Self.changeMediumImage);
			shouldChange = true;
		}
		else if (wetPriority + messyPriority >= 8) {
			responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.Status.Self.changeHighPriority);
			responseEmbed.setImage(stringLibrary.Characters.Ralsei.Change.Status.Self.changeHighImage);
			shouldChange = true;
		}
		if (shouldChange == false) {
			await interaction.followUp({
				embeds: [responseEmbed],
				ephemeral: true });
		}
		if (shouldChange == true) {
			await interaction.followUp({
				embeds: [responseEmbed],
				components: [row3],
				ephemeral: true });
				const changeCollector = await response.awaitMessageComponent({ filter: changeFilter, time: 60000 });
				if (changeCollector.customId === 'confirmButton') {
					await interaction.update({ embeds: [responseEmbed], components: [] });
					//Do Change here
					//change.DoChange(wetCollector.values[0], messyCollector.values[0]);
				}
		}



		const cancelCollector = response.awaitMessageComponent({ filter: cancelFilter, time: 60000 });
		if 


	},
};