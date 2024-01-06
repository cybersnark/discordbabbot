const { SlashCommandBuilder } = require('discord.js');
const Sequelize = require('sequelize');

// Set up the database connection
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	freezetableName: true,
	logging: false,
	// SQLite only
	storage: 'babdb.sqlite',
});

/**
 * Represents the user database model.
 * @typedef {Object} userdb
 * @property {string} name - The name of the user.
 */


const userdb = sequelize.define('user', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
});

/**
 * Represents a diaper stash.
 * @typedef {Object} DiaperStash
 * @property {string} name - The name of the diaper stash.
 * @property {string} brand - The brand of the diapers in the stash.
 * @property {number} quantity - The quantity of diapers in the stash.
 */

const diapStash = sequelize.define('diaperstash', {
	name: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	brand: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	quantity: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});

/**
 * Converts a diaper brand and quantity to a corresponding name.
 * @param {string} brand - The brand of the diaper.
 * @param {number} quantity - The quantity of the diaper.
 * @returns {string} - The corresponding name of the diaper.
 */

/**
 *This function will convert the value of the user's choice into a more user friendly string for the reply.  Will return a pluralized string if the quantity is greater than 1.
 *May change this later.  This is a bit of a mess.
 *I should probably change the database to use the same names as the choices.
 *There might be a better way to store all of the brand names in a specific database table and then reference that table.  This would allow it to scale better.
 */

function valueToName(brand, quantity) {
	switch (brand) {
	case 'peekABU':
		if (quantity === 1) {
			return 'PeekABU';
		}
		else {
			return 'PeekABUs';
		}
	case 'space':
		if (quantity === 1) {
			return 'Space';
		}
		else {
			return 'Spaces';
		}
	case 'pawz':
		return 'Little Pawz';
	case 'simple':
		if (quantity === 1) {
			return 'Simple';
		}
		else {
			return 'Simples';
		}
	case 'preschool':
		if (quantity === 1) {
			return 'PreSchool';
		}
		else {
			return 'PreSchools';
		}
	case 'cushies':
		if (quantity === 1) {
			return 'Cushies';
		}
		else {
			return 'Cushies';
		}
	case 'sdk':
		return 'Super Dry Kids';
	case 'overnights':
		if (quantity === 1) {
			return 'Overnight';
		}
		else {
			return 'Overnights';
		}
	case 'cammies':
		return 'Cammies';
	case 'galactic':
		if (quantity === 1) {
			return 'Galactic';
		}
		else {
			return 'Galactics';
		}
	case 'littleBuilders':
		return 'Little Builders';
	case 'unicorn':
		if (quantity === 1) {
			return 'Unicorn';
		}
		else {
			return 'Unicorns';
		}
	case 'littleRawrs':
		return 'Little Rawrs';
	case 'trestElites':
		if (quantity === 1) {
			return 'Trest Elite';
		}
		else {
			return 'Trest Elites';
		}
	}
}

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
						.setDescription('The brand of diaper to add.')
						.setRequired(true)
						// Add the choices for the brands, will need to be updated as new brands are added.
						.addChoices(
							{ name: 'PeekABU', value: 'peekABU' },
							{ name: 'Space', value: 'space' },
							{ name: 'Little Pawz', value: 'pawz' },
							{ name: 'Simple', value: 'simple' },
							{ name: 'PreSchool', value: 'preschool' },
							{ name: 'Cushies', value: 'cushies' },
							{ name: 'Super Dry Kids', value: 'sdk' },
							{ name: 'Overnights', value: 'overnights' },
							{ name: 'Cammies', value: 'cammies' },
							{ name: 'Galactic', value: 'galactic' },
							{ name: 'Little Builders', value: 'littleBuilders' },
							{ name: 'Unicorn', value: 'unicorn' },
							{ name: 'Little Rawrs', value: 'littleRawrs' },
							{ name: 'Trest Elites', value: 'trestElites' },
						),
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
						// Add the choices for the brands, will need to be updated as new brands are added.
						.addChoices(
							{ name: 'PeekABU', value: 'peekABU' },
							{ name: 'Space', value: 'space' },
							{ name: 'Little Pawz', value: 'pawz' },
							{ name: 'Simple', value: 'simple' },
							{ name: 'PreSchool', value: 'preschool' },
							{ name: 'Cushies', value: 'cushies' },
							{ name: 'Super Dry Kids', value: 'sdk' },
							{ name: 'Overnights', value: 'overnights' },
							{ name: 'Cammies', value: 'cammies' },
							{ name: 'Galactic', value: 'galactic' },
							{ name: 'Little Builders', value: 'littleBuilders' },
							{ name: 'Unicorn', value: 'unicorn' },
							{ name: 'Little Rawrs', value: 'littleRawrs' },
							{ name: 'Trest Elites', value: 'trestElites' },
						),
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
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'add') {
			// Get the user's input for brand and quantity
			const choiceBrand = interaction.options.getString('brand');
			const choiceQuantity = interaction.options.getInteger('quantity');
			// Is the user registered?
			const registeredUser = await userdb.findOne({ where: { name: interaction.user.username } });
			// Find the row that we're updating based on the name and brand selected
			const user = await diapStash.findOne({ where: { name: interaction.user.username, brand: choiceBrand } });
			if (!registeredUser) {
				await interaction.reply({ content: 'Oops! Looks like you\'re not registered, kiddo! Use /register to get started!', ephemeral: true });
			}
			else if (choiceQuantity > 180) {
				return interaction.reply({ content: 'You can\'t add more than 180 diapers at a time.', ephemeral: true });
			}
			else if (choiceQuantity < 1) {
				return interaction.reply({ content: 'You can\'t add less than 1 diaper at a time.', ephemeral: true });
			}
			// If this is the first time a user has added a diaper of this brand to their stash, create a new row.
			if (!user || !user.brand) {
				await diapStash.create({
					name: interaction.user.username,
					brand: choiceBrand,
					quantity: choiceQuantity,
				});
				// Sync the database to commit changes
				await diapStash.sync();
				return interaction.reply({ content: `You have added ${choiceQuantity} ${valueToName(choiceBrand, choiceQuantity)} to your diaper stash.`, ephemeral: true });
			}
			// If the user already has a row for this brand, increment the quantity by the user's input instead.
			else if (user.quantity >= 0) {
				await diapStash.increment({ 'quantity': choiceQuantity }, { where: { name: interaction.user.username, brand: choiceBrand } });
			}
			// Sync the database to commit changes
			await diapStash.sync();
			await interaction.reply({ content: `You have added ${choiceQuantity} ${valueToName(choiceBrand, choiceQuantity)} to your diaper stash.`, ephemeral: true });
		}
		if (interaction.options.getSubcommand() === 'remove') {
			// Get the user's input for brand and quantity
			const choiceBrand = interaction.options.getString('brand');
			const choiceQuantity = interaction.options.getInteger('quantity');
			// Is the user registered?
			const registeredUser = await userdb.findOne({ where: { name: interaction.user.username } });
			// Find the row that we're updating based on the name and brand selected
			const user = await diapStash.findOne({ where: { name: interaction.user.username, brand: choiceBrand } });
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

			await diapStash.decrement({ 'quantity': choiceQuantity }, { where: { name: interaction.user.username, brand: choiceBrand } });
			await diapStash.sync();
			await interaction.reply({ content: `You have removed  ${choiceQuantity} ${valueToName(choiceBrand, choiceQuantity)} from your stash.`, ephemeral: true });
		}
		if (interaction.options.getSubcommand() === 'list') {
			// Find all rows where the user has more than 0 of a given diaper.
			const currentStash = await diapStash.findAll({
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
