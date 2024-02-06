const { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder, SlashCommandBuilder, StringSelectMenuBuilder, TextInputBuilder } = require('discord.js');
const stringLibrary = require('../../config/stringLibrary.json');
const database = require('../../database.js');
const { characterMessage } = require('../../functions/characterMessage.js');
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

	async autocomplete(interaction) {
		// To overcome the 25 string option limit, we can use the autocomplete feature to dynamically generate the list of options.
		const focusedOption = interaction.options.getFocused(true);
		const printChoices = [...paddingList];
		const userChoices = await database.diapStash.findAll({
			raw: true,
			attributes: ['name', 'brand', 'quantity'],
			where: {
				name: interaction.user.username,
				quantity: {
					[Sequelize.Op.gt]: 0,
				},
			},
		});
		let choices;
		if (focusedOption.name === 'brand' && interaction.options.getSubcommand() === 'add') {
			choices = (printChoices);
		}
		else if (focusedOption.name === 'brand' && interaction.options.getSubcommand() === 'remove') {
			choices = userChoices.map(t => t.brand);
		}
		let filtered;
		console.log(focusedOption.value);
		if (focusedOption.value === '' || focusedOption.value === null || focusedOption.value === undefined) {
			filtered = choices.slice(0, 24);
		}
		else {
			filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
		}
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
	async execute(interaction) {
		let user = interaction.options.getUser('user') ?? interaction.user;
		// Let's try and shorten the stringLibrary path by taking the user's chosen caretaker and using it as the root.
		// const characterRoot = stringLibrary.Characters.{client.careTaker} -- not actually defined yet.
		const littleAgeMenu = new StringSelectMenuBuilder()
			.setCustomId('littleAgeMenu')
			.setPlaceholder('What is your little age?')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('0-1')
					.setDescription('0-1 year old')
					.setValue('0'),
				new StringSelectMenuOptionBuilder()
					.setLabel('2-3')
					.setDescription('2-3 years old')
					.setValue('1'),
				new StringSelectMenuOptionBuilder()
					.setLabel('4-7')
					.setDescription('4-7 years old')
					.setValue('2'),
				new StringSelectMenuOptionBuilder()
					.setLabel('8-12')
					.setDescription('8-12 years old')
					.setValue('3'),
			);
		const preferredName = new TextInputBuilder()
			.setCustomId('preferredName')
			.setPlaceholder('What is your preferred name?')
			.setMinLength(2)
			.setMaxLength(64);
		const diaper247Check = new StringSelectMenuBuilder()
			.setCustomId('diaper247Check')
			.setPlaceholder('Do you wear 24/7?')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Yes')
					.setDescription('I wear 24/7')
					.setValue(true),
				new StringSelectMenuOptionBuilder()
					.setLabel('No')
					.setDescription('I don\'t wear 24/7')
					.setValue(false),
			);
		const row1 = new ActionRowBuilder()
			.addComponents(
				littleAgeMenu,
			);
		const row2 = new ActionRowBuilder()
			.addComponents(
				preferredName,
			);
		const row3 = new ActionRowBuilder()
			.addComponents(
				diaper247Check,
			);
		const nameFilter = i => {
			return i.customId === 'preferredName' && i.user.id === interaction.user.id;
		};
		const ageFilter = i => {
			return i.customId === 'littleAgeMenu' && i.user.id === interaction.user.id;
		};
		const diaper247Filter = i => {
			return i.customId === 'diaper247Check' && i.user.id === interaction.user.id;
		};

		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		user = await database.userdb.findOne({ where: { name: user.username } });
		let attachmentImage;
		let attachment;

		if (user) {
			attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Register.alreadyRegistered.text, stringLibrary.Characters.Ralsei.Register.alreadyRegistered.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'alreadyRegistered.png' });
			const response = await interaction.reply({
				files: [attachment],
				ephemeral: true,
			});
		}
		else {
			attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Register.registerStart.text, stringLibrary.Characters.Ralsei.Register.registerStart.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'registerStart.png' });
			const response = await interaction.reply({
				files: [attachment],
				ephemeral: true,
			});
			await wait(2_000);
			attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Register.name.text, stringLibrary.Characters.Ralsei.Register.name.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'name.png' });
			await response.edit(
				{
					files: [attachment],
					components: [row2],
					ephemeral: true,
				},
			);
			const nameCollector = await response.awaitMessageComponent({ filter: nameFilter, time: 60_000 });
			attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Register.nameConfirm.text.replace('[name]', nameCollector.values[0]), stringLibrary.Characters.Ralsei.Register.nameConfirm.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'nameConfirm.png' });
			await nameCollector.update({ files: [attachment], components: [] });
			await wait(2_000);
			attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Register.littleAge.text, stringLibrary.Characters.Ralsei.Register.littleAge.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'littleAge.png' });
			await response.edit(
				{
					files: [attachment],
					components: [row1],
					ephemeral: true,
				},
			);
			const ageCollector = await response.awaitMessageComponent({ filter: ageFilter, time: 60_000 });
			attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Register.littleAgeConfirm.text, stringLibrary.Characters.Ralsei.Register.littleAgeConfirm.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'littleAgeConfirm.png' });
			await ageCollector.update({ files: [attachment], components: [] });
			await wait(2_000);
			attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Register.diaper247Check.text, stringLibrary.Characters.Ralsei.Register.diaper247Check.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'diaper247Check.png' });
			await response.edit(
				{
					files: [attachment],
					components: [row3],
					ephemeral: true,
				},
			);
			const diaper247Collector = await response.awaitMessageComponent({ filter: diaper247Filter, time: 60_000 });
			if (diaper247Collector.values[0] === true) {
				attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Register.diaper247Confirm.text, stringLibrary.Characters.Ralsei.Register.diaper247Confirm.image);
				attachment = new AttachmentBuilder(attachmentImage, { name: 'diaper247Confirm.png' });
				await diaper247Collector.update({ files: [attachment], components: [] });
			}
			else if (diaper247Collector.values[0] === false) {
				attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Register.diaper247NoDiapers.text, stringLibrary.Characters.Ralsei.Register.diaper247NoDiapers.image);
				attachment = new AttachmentBuilder(attachmentImage, { name: 'diaper247NoDiapers.png' });
				await diaper247Collector.update({ files: [attachment], components: [] });
			}
			await wait(2_000);
			attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Register.registerFinish.text, stringLibrary.Characters.Ralsei.Register.registerFinish.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'registerFinish.png' });
			await response.edit(
				{
					files: [attachment],
					ephemeral: true,
				},
			);
		}
	},
};