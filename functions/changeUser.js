const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType, EmbedBuilder } = require('discord.js');
const database = require('../database.js');
const Sequelize = require('sequelize');
const stringLibrary = require('../config/stringLibrary.json');
const { characterMessage } = require('./characterMessage.js');
const wait = require('node:timers/promises').setTimeout;
module.exports = async (client, interaction, args) => {
	const brands = await database.diapStash.findAll({
		attributes: ['brand'],
		where: {
			name: interaction.user.username,
			quantity: {
				[Sequelize.Op.gt]: 0,
			},
		},
	});

	if (brands.length === 0) {
		return interaction.reply({ content: 'Uh oh!  Looks like you\'re out of diapers!  You\'ll need to get some more before I can change you!', ephemeral: true });
	}

	const brandOptions = brands.map(brand => new StringSelectMenuOptionBuilder()
		.setLabel(brand.brand)
		.setValue(brand.brand),
	);
	const brandMenu = new StringSelectMenuBuilder()
		.setCustomId('brandMenu')
		.setPlaceholder('Pick a diaper from your stash!')
		.addOptions(brandOptions);

	const boosterMenu = new StringSelectMenuBuilder()
		.setCustomId('boosterMenu')
		.setPlaceholder('Do you want to add a booster?')
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel('Yes')
				.setDescription('I want a booster!')
				.setValue(true),
			new StringSelectMenuOptionBuilder()
				.setLabel('No')
				.setDescription('I don\'t want a booster.')
				.setValue(false),
		);

	const brandEmbed = new EmbedBuilder()
		.setTitle('Select a brand')
		.setDescription(stringLibrary.Characters.Ralsei.Change.General.brandSelect)
		.setColor('#31a8f8')
		.setImage(stringLibrary.Characters.Ralsei.Change.General.brandSelectImage);

	const row1 = new ActionRowBuilder()
		.addComponents(
			brandMenu,
		);
	const row2 = new ActionRowBuilder()
		.addComponents(
			boosterMenu,
		);

	const response = await interaction.reply({
		embeds: [brandEmbed],
		components: [row1, row2],
		ephemeral: true });
	const responseEmbed = new EmbedBuilder()
		.setTitle('PLACEHOLDER - DIAPER CHANGE RESPONSE')
		.setDescription(stringLibrary.Characters.Ralsei.Change.Response)
		.setColor('#ebebeb');
	const brandFilter = i => {
		return i.customId === 'brandMenu' && i.user.id === interaction.user.id;
	};

	const brandCollector = await response.awaitMessageComponent({ filter: brandFilter, time: 60_000 });
	responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.General.brandSelectResponse.replace('{brand}', brandCollector.values[0]));
	try {
		const currentDiap = await database.diapStatus.findOne({ attributes: ['brand'] }, { where: { name: interaction.user.username } });
		await database.diapChangeTracker.create({
			name: interaction.user.username,
			previousBrand: currentDiap,
			brand: brandCollector.values[0],
			wet: interaction.options.getString('wetMenu'),
			messy: interaction.options.getString('messyMenu'),
			changetime: new Date(),
		});
		database.diapChangeTracker.save();

		await database.diapStatus.update({
			brand: brandCollector.values[0],
			wet: 'Dry',
			messy: 'Clean',
			booster: interaction.options.getString('boosterMenu'),
			lastChange: new Date(),
			lastUpdated: new Date(),
		}, { where: { name: interaction.user.username } });
		database.diapStatus.save();
		await database.diapStash.decrement({ 'quantity': 1 }, { where: { name: interaction.user.username, brand: brandCollector.values[0] } });
		database.diapStash.save();
	}
	catch (e) {
		console.log(e);
		return interaction.reply({ content: 'You didn\'t select an option in time!' });
	}

	// TODO: Let's break out these response blocks into a function
	await response.followUp({ embeds: [responseEmbed], ephemeral: true });
	await wait(3000);
	responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.General.ChangeConfirm);
	responseEmbed.setImage(stringLibrary.Characters.Ralsei.Change.General.ChangeConfirmImage);
	await response.edit({ embeds: [responseEmbed], components: [] });
	await wait(1500);
	responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.General.Change);
	responseEmbed.setImage(stringLibrary.Characters.Ralsei.Change.General.ChangeImage);
	await response.edit({ embeds: [responseEmbed], components: [] });
	await wait(1500);
	responseEmbed.setDescription(stringLibrary.Characters.Ralsei.Change.General.ChangeComplete);
	responseEmbed.setImage(stringLibrary.Characters.Ralsei.Change.General.ChangeCompleteImage);
	await response.edit({ embeds: [responseEmbed], components: [] });


};