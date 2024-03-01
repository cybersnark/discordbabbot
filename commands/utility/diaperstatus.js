const { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType, EmbedBuilder, SlashCommandUserOption } = require('discord.js');
const changeUser = require('../../functions/changeUser.js');
const stringLibrary = require('../../config/stringLibrary.json');
const characterLogic = require('../../config/characterLogic.json');
const database = require('../../database.js');
const { characterMessage } = require('../../functions/characterMessage.js');
const wait = require('node:timers/promises').setTimeout;

// TODO: Allow users to run this command on another user. If the user is not specified, the bot will assume the user is running the command on themselves.
// If run on themselves, the bot will check the user's diaper status and prompt them to change if necessary.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('diapercheck')
		.setDescription('Checks and updates the diaper status of the user.')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user to check the diaper status of.')
				.setRequired(false),
		),
	async execute(interaction, client) {
		const user = await database.userdb.findOne({ where: { name: interaction.user.username } });
		const wetMenu = new StringSelectMenuBuilder()
			.setCustomId('wetMenu')
			.setPlaceholder('How wet is your diaper?')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Dry')
					.setDescription('I\'m still dry!')
					.setValue('dry'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Damp')
					.setDescription('I\'m a little damp...')
					.setValue('damp'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Wet')
					.setDescription('I\'m wet!')
					.setValue('wet'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Soaked')
					.setDescription('I\'m soaked!')
					.setValue('soaked'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Leaking')
					.setDescription('Oh no!  I\'m leaking!')
					.setValue('leaking'),
			);
		const messyMenu = new StringSelectMenuBuilder()
			.setCustomId('messyMenu')
			.setPlaceholder('And how messy is your diaper?~')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Clean')
					.setDescription('I\'m still clean!')
					.setValue('clean'),
				new StringSelectMenuOptionBuilder()
					.setLabel('A little messy')
					.setDescription('I had a tiny accident!')
					.setValue('littleMessy'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Kinda messy')
					.setDescription('I had an accident but it\'s not too bad!')
					.setValue('messy'),
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

		const ctStatus = stringLibrary.Characters.Ralsei.Change.status.self;
		const ctPriority = stringLibrary.Characters.Ralsei.Change.priority;
		const ctChange = stringLibrary.Characters.Ralsei.Change.General;


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


		// TODO: Let's add a separate response block here before diving into the status check. If the user is initiating a check on themselves, the response should be different than one that occurs on a schedule.
		/* const response = await interaction.reply({
				files: [attachment],
				components: [row1],
				ephemeral: true });
				*/
		await client.ctMessage({
			text: [ctStatus.wet.check],
			type: 'reply',
			components: [row1],
			ephemeral: true,
		}, interaction);

		const wetFilter = i => {
			return i.customId === 'wetMenu' && i.user.id === interaction.user.id;
		};
		const messyFilter = i => {
			return i.customId === 'messyMenu' && i.user.id === interaction.user.id;
		};
		const changeFilter = i => {
			return (i.customId === 'confirmButton' || i.customId === 'cancelButton') && i.user.id === interaction.user.id;
		};
			// TODO: Add consideration for the user to add a booster
			// If user has a booster, wetness will be reduced by 2 levels

		let wetPriority = 0;
		let messyPriority = 0;

		const wetCollector = await interaction.channel.awaitMessageComponent({ filter: wetFilter, time: 60000, max:1 });
		await wetCollector.deferUpdate();
		/*
			attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Change.status.self.wet[wetCollector.values[0]].text, stringLibrary.Characters.Ralsei.Change.status.self.wet[wetCollector.values[0]].image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'diaperStatus.png' });
			await wetCollector.update({ files:[attachment], components: [row2] });
			*/
		wetPriority = characterLogic.Characters.Ralsei.changeLogic.diaperStatus[wetCollector.values[0]].changePriority;
		await client.ctMessage({
			text: [ctStatus.wet[wetCollector.values[0]]],
			type: 'editreply',
			components: [],
			ephemeral: true,
			timeout: 2,
		}, interaction);

		await client.ctMessage({
			text: [ctStatus.messy.check],
			type: 'editreply',
			components: [row2],
			ephemeral: true,
		}, interaction);

		const messyCollector = await interaction.channel.awaitMessageComponent({ filter: messyFilter, time: 60000, max:1 });
		await messyCollector.deferUpdate();
		messyPriority = characterLogic.Characters.Ralsei.changeLogic.diaperStatus[messyCollector.values[0]].changePriority;

		/*
			attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Change.status.self.messy[messyCollector.values[0]].text, stringLibrary.Characters.Ralsei.Change.status.self.messy[messyCollector.values[0]].image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'diaperStatus.png' });
			await messyCollector.update({ files:[attachment], components: [] });
			await wait (3_000);
			*/
		await client.ctMessage({
			text: [ctStatus.messy[messyCollector.values[0]]],
			type: 'editreply',
			components: [],
			ephemeral: true,
			timeout: 2,
		}, interaction);
		if (wetPriority + messyPriority == 0) {
			await client.ctMessage({
				text: [ctPriority.nochange],
				type: 'editreply',
				components: [],
				ephemeral: true,
			}, interaction);
		}
		else if (wetPriority + messyPriority > 0 && wetPriority + messyPriority <= 3) {
			await client.ctMessage({
				text: [ctPriority.lowpriority],
				type: 'editreply',
				components: [],
				ephemeral: true,
			}, interaction);
		}
		else if (wetPriority + messyPriority >= 4 && wetPriority + messyPriority <= 7) {
			await client.ctMessage({
				text: [ctPriority.mediumpriority],
				type: 'editreply',
				components: [row3],
				ephemeral: true,
			}, interaction);
		}
		else if (wetPriority + messyPriority >= 8) {
			await client.ctMessage({
				text: [ctPriority.highpriority],
				type: 'editreply',
				components: [row3],
				ephemeral: true,
			}, interaction);
		}
		/*
			if (shouldChange == false) {
				await response.edit({
					files: [attachment],
					ephemeral: true });
			}
			if (shouldChange == true) {
				await response.edit({
					files: [attachment],
					components: [row3],
					ephemeral: true });
					*/
		const changeCollector = await interaction.channel.awaitMessageComponent({ filter: changeFilter, time: 60000 });
		await changeCollector.deferUpdate();
		if (changeCollector.customId === 'confirmButton') {
			await client.ctMessage({
				text: [ctChange.changeConfirm],
				type: 'followup',
				components: [],
				ephemeral: true,
				timeout: 2,
			}, interaction);
			changeUser(new interaction, client, wetCollector.values[0], messyCollector.values[0]);
		}
		else {
			await database.diapStatus.findOne({ where: { name: user.username } });
			console.log(user);
		}
	},
};