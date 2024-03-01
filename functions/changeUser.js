const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, AttachmentBuilder } = require('discord.js');
const database = require('../database.js');
const Sequelize = require('sequelize');
const stringLibrary = require('../config/stringLibrary.json');
const { characterMessage } = require('./characterMessage.js');
const wait = require('node:timers/promises').setTimeout;
module.exports = async (interaction, client, wetness, messiness) => {
	// Let's represent each step of the change in this variable.  This will allow us to use stringLibrary in a more readable manner.
	// We'll also use this to determine which image to display.
	// TODO: To allow for greater configuration flexibility, we could expand this into a "nextStep" function that takes the current step and returns the next step.
	// This would allow us to easily add or remove steps from the change process using a configuration file.
	// We could even condense this entire process into a for loop that iterates through the steps, calling nextStep each time.
	let stage;
	console.log(interaction);
	const tracker = database.diapChangeTracker;
	const users = database.userdb;
	const stash = database.diapStash;
	const dcStr = stringLibrary.Characters.Ralsei.Change;
	const brands = await database.diapStash.findAll({
		attributes: ['brand'],
		where: {
			name: interaction.user.username,
			quantity: {
				[Sequelize.Op.gt]: 0,
			},
		},
	});
	const publicChange = await users.findOne({
		attributes: ['publicChange'],
		where: {
			name: interaction.user.username,
		},
	});

	const name = await users.findOne({
		attributes: ['preferredName'],
		where: {
			name: interaction.user.username,
		},
	});


	if (brands.length === 0) {
		return interaction.reply({ content: 'Uh oh!  Looks like you\'re out of diapers!  You\'ll need to get some more before I can change you!', ephemeral: publicChange });
	}

	const brandOptions = brands.map(brand => new StringSelectMenuOptionBuilder()
		.setLabel(brand.brand, '(x' + brand.quantity + ')')
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
				.setValue('true'),
			new StringSelectMenuOptionBuilder()
				.setLabel('No')
				.setDescription('I don\'t want a booster.')
				.setValue('false'),
		);

	const confirmButton = new ButtonBuilder()
		.setCustomId('confirmButton')
		.setLabel('Confirm Change')
		.setStyle(ButtonStyle.Success);
	const cancelButton = new ButtonBuilder()
		.setCustomId('cancelButton')
		.setLabel('Cancel Change')
		.setStyle(ButtonStyle.Danger);


	const row1 = new ActionRowBuilder()
		.addComponents(
			brandMenu,
		);

	const row2 = new ActionRowBuilder()
		.addComponents(
			boosterMenu,
		);

	const row3 = new ActionRowBuilder()
		.addComponents(
			confirmButton,
			cancelButton,
		);

	let attachment;
	let attachmentImage;
	/*
	attachmentImage = characterMessage(dcStr.General.Change[stage].text.replace('[name]', name), dcStr.General.Change[stage].image);
	attachment = new AttachmentBuilder(attachmentImage, 'brandSelect.png');
	*/

	await client.ctMessage({
		text: [dcStr.General.brandSelect],
		type: 'reply',
		components: [row1, row2],
		ephemeral: true,
	}, interaction);
	/*
	const response = await interaction.reply({
		files: [attachment],
		components: [row1, row2],
		ephemeral: true });
	*/

	const brandFilter = i => {
		return i.customId === 'brandMenu' && i.user.id === interaction.user.id;
	};
	const brandCollector = await interaction.channel.awaitMessageComponent({ filter: brandFilter, time: 60_000, max: 1 });
	brandCollector.deferUpdate();

	await client.ctMessage({
		text: [dcStr.General.brandSelectResponse],
		type: 'editreply',
		components: [],
		ephemeral: true,
		timeout:2,
	}, interaction);

	/*
	stage = 'brandSelectResponse';
	attachmentImage = characterMessage(dcStr.General.Change[stage].text.replace('[name]', name), dcStr.General.Change[stage].image);
	attachment = new AttachmentBuilder(attachmentImage, 'brandSelectResponse.png');

	await response.editReply({
		files: [attachment],
		ephemeral: true,
	});

	stage = 'changeConfirm';

	attachmentImage = characterMessage(dcStr.General.Change[stage].text.replace('[name]', name), dcStr.General.Change[stage].image);
	attachment = new AttachmentBuilder(attachmentImage, 'changeConfirm.png');
	*/

	const response = await client.ctMessage({
		text: [dcStr.General.changeConfirm],
		type: 'followup',
		components: [row3],
		ephemeral: true,
		deleteReply: true,
	}, interaction);
	await response.followUp({
		files: [attachment],
		components: [row3],
		ephemeral: publicChange,
	});
	const confirmFilter = i => {
		return (i.customId === 'confirmButton' || i.customId === 'cancelButton') && (i.user.id === interaction.user.id);
	};
	const confirmCollector = await response.awaitMessageComponent({ filter: confirmFilter, time: 60_000 });
	if (confirmCollector.customId === 'confirmButton') {
		if (publicChange === true) {
			stage = 'change_public';
		}
		else {
			stage = 'change';
		}

		await change.edit({
			files: [attachment],
			components: [],
			ephemeral: publicChange,
		}, interaction);

		await wait(3_500);

		if (publicChange === true) {
			stage = 'changeEnd_public';
		}
		else {
			stage = 'changeEnd';
		}

		attachmentImage = characterMessage(dcStr.General.Change[stage].text.replace('[name]', name), dcStr.General.Change[stage].image);
		attachment = new AttachmentBuilder(attachmentImage, 'changeEnd.png');
		await change.edit({
			files: [attachment],
			components: [],
			ephemeral: publicChange,
		});
		try {
			const currentDiap = await status.findOne({ attributes: ['brand'] }, { where: { name: interaction.user.username } });
			await tracker.create({
				name: interaction.user.username,
				previousBrand: currentDiap,
				brand: brandCollector.values[0],
				wet: interaction.options.getString('wetMenu'),
				messy: interaction.options.getString('messyMenu'),
				changetime: new Date(),
			});
			await status.update({
				brand: brandCollector.values[0],
				wet: 'Dry',
				messy: 'Clean',
				booster: interaction.options.getString('boosterMenu'),
				lastChange: new Date(),
				lastUpdated: new Date(),
			}, { where: { name: interaction.user.username } });
			await stash.decrement({ 'quantity': 1 }, { where: { name: interaction.user.username, brand: brandCollector.values[0] } });
		}
		catch (e) {
			console.log(e);
			return interaction.reply({ content: 'You didn\'t select an option in time!' });
		}
	}
	else {
		stage = 'changeCancel';
		attachmentImage = characterMessage(dcStr.General.Change[stage].text.replace('[name]', name), dcStr.General.Change[stage].image);
		attachment = new AttachmentBuilder(attachmentImage, 'changeCancel.png');
		await response.editReply({
			files: [attachment],
			components: [],
			ephemeral: publicChange,
		});
		return;
	}


};