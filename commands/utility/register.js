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
		const characterRoot = stringLibrary.Characters.{client.careTaker}
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
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		user = await database.userdb.findOne({ where: { name: user.username } });
		let attachmentImage;
		let attachment;

		if (user) {
			attachmentImage = await characterMessage(stringLibrary.Characters.Ralsei.Register.alreadyRegistered.text, stringLibrary.Characters.Ralsei.Register.alreadyRegistered.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'alreadyRegistered.png' });
			let response = await interaction.reply({
				files: [attachment],
				ephemeral: true,

			});
		}
		else {
			await characterMessage(stringLibrary.Characters.Ralsei.Register.registerStart.text, stringLibrary.Characters.Ralsei.Register.registerStart.image);
			await wait(2_000);
			await database.userdb.create({
				name: interaction.user.username,
			});
			user = await database.userdb.findOne({ where: { name: user.username } });
			await interaction.followUp({ content: 'All done! You\'re now registered!', ephemeral: true });
		}
	},
};