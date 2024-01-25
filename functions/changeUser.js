const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType, EmbedBuilder } = require('discord.js');
const database = require('../../database.js');
const Sequelize = require('sequelize');
const stringLibrary = require('../../config/stringLibrary.json');
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

	const brandEmbed = new EmbedBuilder()
		.setTitle('Select a brand')
		.setDescription(stringLibrary.Characters.Ralsei.Change.General.brandSelect)
		.setColor('#31a8f8')
		.setImage(stringLibrary.Characters.Ralsei.Change.General.brandSelectImage);

	const row1 = new ActionRowBuilder()
		.addComponents(
			brandMenu,
		);

	const response = await interaction.reply({
		embeds: [brandEmbed],
		components: [row1],
		ephemeral: true });

	const brandFilter = i => {
		return i.customId === 'brandMenu' && i.user.id === interaction.user.id;
	};

    const brandCollector = await response.awaitMessageComponent({ filter: brandFilter, time: 60_000 });
    
};