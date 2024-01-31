const { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType, EmbedBuilder, SlashCommandUserOption } = require('discord.js');
const changeUser = require('../../functions/changeUser.js');
const { GlobalFonts } = require('@napi-rs/canvas');
const Canvas = require('@napi-rs/canvas');
const stringLibrary = require('../../config/stringLibrary.json');
const characterLogic = require('../../config/characterLogic.json');
const database = require('../../database.js');
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
	async execute(interaction) {
		const user = interaction.options.getUser('user') ?? interaction.user;
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
		GlobalFonts.registerFromPath('../../font/DeterminationMonoWebRegular-Z5oq.ttf');
		const canvas = Canvas.createCanvas(909, 270);
		const context = canvas.getContext('2d');
		context.font = '32px Determination Mono Web';
		context.fillStyle = '#ffffff';
		const wetBackground = await Canvas.loadImage('https://i.imgur.com/Eu7oan4.png');
		context.drawImage(wetBackground, 0, 0, canvas.width, canvas.height);
		context.fillText(stringLibrary.Characters.Ralsei.Change.status.self.wet.check.text, 270, 96, 603);
		const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'wetBackground.png' });

		const wetEmbed = new EmbedBuilder()
			.setTitle('PLACEHOLDER - WET DIAPER QUERY')
			.setDescription(stringLibrary.Characters.Ralsei.Change.status.self.wet.check.text)
			.setColor('#ebebeb');
		const messyEmbed = new EmbedBuilder()
			.setTitle('PLACEHOLDER - MESSY DIAPER QUERY')
			.setDescription(stringLibrary.Characters.Ralsei.Change.status.self.messy.check.text)
			.setColor('#ebebeb');
		const responseEmbed = new EmbedBuilder()
			.setTitle('PLACEHOLDER - DIAPER CHANGE RESPONSE')
			.setDescription(stringLibrary.Characters.Ralsei.Change.General.changeStart)
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
		if (user.id === interaction.user.id) {

			// TODO: Let's add a separate response block here before diving into the status check. If the user is initiating a check on themselves, the response should be different than one that occurs on a schedule.
			const response = await interaction.reply({
				files: [attachment],
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
			// TODO: Add consideration for the user to add a booster
			// If user has a booster, wetness will be reduced by 2 levels

			let wetPriority = 0;
			let messyPriority = 0;
			let shouldChange = false;

			const wetCollector = await response.awaitMessageComponent({ filter: wetFilter, time: 60000 });
			wetPriority = characterLogic.Characters.Ralsei.changeLogic.diaperStatus[wetCollector.values[0]].changePriority;
			responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.status.self.wet[wetCollector.values[0]].text);
			responseEmbed.setImage(stringLibrary.Characters.Ralsei.Change.status.self.wet[wetCollector.values[0]].image);
			await wetCollector.update({ embeds: [responseEmbed, messyEmbed], components: [row2] });

			const messyCollector = await response.awaitMessageComponent({ filter: messyFilter, time: 60000 });
			messyPriority = characterLogic.Characters.Ralsei.changeLogic.diaperStatus[messyCollector.values[0]].changePriority;
			responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.status.self.messy[messyCollector.values[0]].text);
			responseEmbed.setImage(stringLibrary.Characters.Ralsei.Change.status.self.messy[messyCollector.values[0]].image);
			await messyCollector.update({ embeds: [responseEmbed], components: [] });
			await wait (3_000);
			if (wetPriority + messyPriority == 0) {
				responseEmbed.setDescription('PLACEHOLDER - NO CHANGE');
				responseEmbed.setImage('https://i.imgur.com/JJ4KxbS.png');
				shouldChange = false;

			}
			else if (wetPriority + messyPriority > 0 && wetPriority + messyPriority <= 3) {
				responseEmbed.setDescription('PLACEHOLDER - LOW PRIORITY CHANGE');
				responseEmbed.setImage('https://i.imgur.com/JJ4KxbS.png');
				shouldChange = false;
			}
			else if (wetPriority + messyPriority >= 4 && wetPriority + messyPriority <= 7) {
				responseEmbed.setDescription('PLACEHOLDER - MEDIUM PRIORITY CHANGE');
				responseEmbed.setImage('https://i.imgur.com/JJ4KxbS.png');
				shouldChange = true;
			}
			else if (wetPriority + messyPriority >= 8) {
				responseEmbed.setDescription('stringLibrary.Characters.Ralsei.Change.status.self.changeHighPriority');
				responseEmbed.setImage('https://i.imgur.com/JJ4KxbS.png');
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
					// Do Change here
					changeUser(wetCollector.values[0], messyCollector.values[0]);
				}
			}
		}
		else {
			const userStatus = await database.diapStatus.findOne({ where: { name: user.username } });
			console.log(user);
		}
	},
};