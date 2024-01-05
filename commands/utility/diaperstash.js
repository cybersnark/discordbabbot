const { SlashCommandBuilder } = require('discord.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	freezetableName: true,
	logging: false,
	// SQLite only
	storage: 'babdb.sqlite',
});

const userdb = sequelize.define('user', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
});

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
		.setName('diaperstash')
		.setDescription('Tracks how many diapers the user has in their stash.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Adds a diaper to the stash.')
				.addStringOption(option =>
					option
						.setName('brand')
						.setDescription('The brand of diaper to add.')
						.setRequired(true)
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
						.setName('quantity')
						.setDescription('The number of diapers to add.')
						.setRequired(true)
						.setMinValue(1)
						.setMaxValue(180),

				))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Removes a diaper from the stash.')
				.addStringOption(option =>
					option
						.setName('brand')
						.setDescription('The brand of diaper to remove.')
						.setRequired(true)
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
						.setName('quantity')
						.setDescription('The number of diapers to remove.')
						.setRequired(true)
						.setMinValue(1)
						.setMaxValue(180),
				))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Displays your current diaper stash'),
		),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'add') {
			const choiceBrand = interaction.options.getString('brand');
			const choiceQuantity = interaction.options.getInteger('quantity');
			const registeredUser = await userdb.findOne({ where: { name: interaction.user.username } });
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
			if (!user || !user.brand) {
				await diapStash.create({
					name: interaction.user.username,
					brand: choiceBrand,
					quantity: choiceQuantity,
				});
				await diapStash.sync();
				return interaction.reply({ content: `You have added ${choiceQuantity} ${valueToName(choiceBrand, choiceQuantity)} to your diaper stash.`, ephemeral: true });
			}
			else if (user.quantity >= 0) {
				await diapStash.increment({ 'quantity': choiceQuantity }, { where: { name: interaction.user.username, brand: choiceBrand } });
			}

			await diapStash.sync();
			// TODO: Create a function to translate the value of the user's choice into a more user friendly string for the reply.
			await interaction.reply({ content: `You have added ${choiceQuantity} ${valueToName(choiceBrand, choiceQuantity)} to your diaper stash.`, ephemeral: true });
		}
		if (interaction.options.getSubcommand() === 'remove') {
			const choiceBrand = interaction.options.getString('brand');
			const choiceQuantity = interaction.options.getInteger('quantity');
			const registeredUser = await userdb.findOne({ where: { name: interaction.user.username } });
			const user = await diapStash.findOne({ where: { name: interaction.user.username, brand: choiceBrand } });
			if (!registeredUser) {
				await interaction.reply({ content: 'Oops! Looks like you\'re not registered, kiddo! Use /register to get started!', ephemeral: true });
			}
			if (!user || !user.brand) {
				return interaction.reply({ content: 'You don\'t have any of that diaper in your stash.', ephemeral: true });
			}
			else if (choiceQuantity < 1) {
				return interaction.reply({ content: 'You can\'t remove less than 1 diaper at a time.', ephemeral: true });
			}
			else if (choiceQuantity > user.quantity) {
				return interaction.reply({ content: 'You can\'t remove more diapers than you have.', ephemeral: true });
			}

			await diapStash.decrement({ 'quantity': choiceQuantity }, { where: { name: interaction.user.username, brand: choiceBrand } });
			await diapStash.sync();
			await interaction.reply({ content: `You have removed  ${choiceQuantity} ${valueToName(choiceBrand, choiceQuantity)} from your stash.`, ephemeral: true });
		}
		if (interaction.options.getSubcommand() === 'list') {
			const currentStash = await diapStash.findAll({
				attributes: ['name', 'brand', 'quantity'],
				where: {
					name: interaction.user.username,
					quantity: {
						[Sequelize.Op.gt]: 0,
					},
				},
			});
			const stashString = currentStash.map(t => `${t.quantity} ${valueToName(t.brand, t.quantity)}`).join('\n') || 'No diapers in your stash.';
			await interaction.reply({ content: `${stashString}`, ephemeral: true });
		}
	},
};
