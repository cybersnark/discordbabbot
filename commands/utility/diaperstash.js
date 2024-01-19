const { SlashCommandBuilder } = require('discord.js');
const _ = require('lodash');
const { valueToName } = require('../../functions/valueToName.js');
const Sequelize = require('sequelize');
const padding = require('../../config/padding.json');
const database = require('../../database.js');

const paddingList = _.uniq(Object.values(padding.Diapers).map(brand => brand.name));

module.exports = {
	data: new SlashCommandBuilder()
	// Set up the base diaperstash command
		.setName('diaperstash')
		.setDescription('Tracks how many diapers the user has in their stash.')
		// Add the 'add' subcommand
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Adds a diaper to the stash.')
				.addStringOption(option =>
					option
						.setName('brand')
						.setDescription('The type of diaper to add.')
						.setRequired(true)
						.setAutocomplete(true),
				)
				.addIntegerOption(option =>
					option
					// Set up the quantity option
					// Quantity cannot be less than 1 or more than 180.  May change this later.
						.setName('quantity')
						.setDescription('The number of diapers to add.')
						.setRequired(true)
						.setMinValue(1)
						.setMaxValue(180),
				))
		.addSubcommand(subcommand =>
			subcommand
			// Set up the remove subcommand
				.setName('remove')
				.setDescription('Removes a diaper from the stash.')
				.addStringOption(option =>
					option
						.setName('brand')
						.setDescription('The brand of diaper to remove.')
						.setRequired(true)
						.setAutocomplete(true),
				)
				.addIntegerOption(option =>
					option
					// Set up the quantity option
					// Quantity cannot be less than 1 or more than 180.  May change this later.
						.setName('quantity')
						.setDescription('The number of diapers to remove.')
						.setRequired(true)
						.setMinValue(1)
						.setMaxValue(180),
				))
		.addSubcommand(subcommand =>
			subcommand
			// Set up the list subcommand
			// Lists only diapers with a quantity greater than 0.
				.setName('list')
				.setDescription('Displays your current diaper stash'),
		),
	async autocomplete(interaction) {
		// To overcome the 25 string option limit, we can use the autocomplete feature to dynamically generate the list of options.
		console.log('Autocomplete Test');
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
		if (interaction.options.getSubcommand() === 'add') {
			// Get the user's input for brand and quantity
			const choiceBrand = interaction.options.getString('brand');
			const choiceQuantity = interaction.options.getInteger('quantity');
			// Is the user registered?
			const registeredUser = await database.userdb.findOne({ where: { name: interaction.user.username } });
			// Find the row that we're updating based on the name and brand selected
			const user = await database.diapStash.findOne({ where: { name: interaction.user.username, brand: choiceBrand } });
			if (!registeredUser) {
				await interaction.reply({ content: 'Oops! Looks like you\'re not registered, kiddo! Use /register to get started!', ephemeral: true });
			}
			else if (choiceQuantity > 180) {
				return interaction.reply({ content: 'You can\'t add more than 180 diapers at a time.', ephemeral: true });
			}
			else if (choiceQuantity < 1) {
				return interaction.reply({ content: 'You can\'t add less than 1 diaper at a time.', ephemeral: true });
			}
			if (!paddingList.includes(choiceBrand)) {
				return interaction.reply({ content: 'That\'s not a valid diaper brand.', ephemeral: true });
			}
			// If this is the first time a user has added a diaper of this brand to their stash, create a new row.
			if (!user || !user.brand) {
				await database.diapStash.create({
					name: interaction.user.username,
					brand: choiceBrand,
					quantity: choiceQuantity,
				});
				// Sync the database to commit changes
				await database.diapStash.sync();
				return interaction.reply({ content: `You have added ${choiceQuantity} ${valueToName(choiceBrand, choiceQuantity)} to your diaper stash.`, ephemeral: true });
			}
			// If the user already has a row for this brand, increment the quantity by the user's input instead.
			else if (user.quantity >= 0) {
				await database.diapStash.increment({ 'quantity': choiceQuantity }, { where: { name: interaction.user.username, brand: choiceBrand } });
			}
			// Sync the database to commit changes
			await database.diapStash.sync();
			await interaction.reply({ content: `You have added ${choiceQuantity} ${valueToName(choiceBrand, choiceQuantity)} to your diaper stash.`, ephemeral: true });
		}
		if (interaction.options.getSubcommand() === 'remove') {
			// Get the user's input for brand and quantity
			const choiceBrand = interaction.options.getString('removeprint');
			const choiceQuantity = interaction.options.getInteger('quantity');
			// Is the user registered?
			const registeredUser = await database.userdb.findOne({ where: { name: interaction.user.username } });
			// Find the row that we're updating based on the name and brand selected
			const user = await database.diapStash.findOne({ where: { name: interaction.user.username, brand: choiceBrand } });
			if (!registeredUser) {
				await interaction.reply({ content: 'Oops! Looks like you\'re not registered, kiddo! Use /register to get started!', ephemeral: true });
			}
			// If the user never had any of the selected diaper or the row does not exist, return an error.
			if (!user || !user.brand) {
				return interaction.reply({ content: 'You don\'t have any of that diaper in your stash.', ephemeral: true });
			}
			else if (choiceQuantity < 1) {
				return interaction.reply({ content: 'You can\'t remove less than 1 diaper at a time.', ephemeral: true });
			}
			// If the user tries to remove more diapers than they have, return an error.
			else if (choiceQuantity > user.quantity) {
				return interaction.reply({ content: 'You can\'t remove more diapers than you have.', ephemeral: true });
			}

			await database.diapStash.decrement({ 'quantity': choiceQuantity }, { where: { name: interaction.user.username, brand: choiceBrand } });
			await database.diapStash.sync();
			await interaction.reply({ content: `You have removed  ${choiceQuantity} ${valueToName(choiceBrand, choiceQuantity)} from your stash.`, ephemeral: true });
		}
		if (interaction.options.getSubcommand() === 'list') {
			// Find all rows where the user has more than 0 of a given diaper.
			const currentStash = await database.diapStash.findAll({
				attributes: ['name', 'brand', 'quantity'],
				where: {
					name: interaction.user.username,
					quantity: {
						[Sequelize.Op.gt]: 0,
					},
				},
			});
			// Convert this to a string with a line break between each diaper.
			const stashString = currentStash.map(t => `${t.quantity} ${valueToName(t.brand, t.quantity)}`).join('\n') || 'No diapers in your stash.';
			await interaction.reply({ content: `${stashString}`, ephemeral: true });
		}
	},
};
