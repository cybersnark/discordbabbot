const { ActionRowBuilder, AttachmentBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, StringSelectMenuBuilder, SlashCommandSubcommandGroupBuilder } = require('discord.js');
const database = require('../../database.js');
const stringLibrary = require('../../config/stringLibrary.json');
const wait = require('node:timers/promises').setTimeout;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('caretaker')
		.setDescription('Caretaker preferences')
		.addSubcommandGroup(group =>
			group
				.setName('preferences')
				.setDescription('Set your caretaker preferences.')
				.addSubcommand(subcommand =>
					subcommand
						.setName('public_change')
						.setDescription('Would you like your caretaker to announce your changes publicly?')
						.addBooleanOption(option =>
							option
								.setName('public_change')
								.setDescription('Would you like your caretaker to announce your changes publicly?')
								.setRequired(true),

						),
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('preferred_name')
						.setDescription('Set your preferred name.')
						.addStringOption(option =>
							option
								.setName('preferred_name')
								.setDescription('Set your preferred name.')
								.setRequired(true),
						),
				),
		),
	async execute(interaction) {
		const { options } = interaction;
		const users = database.userdb;
		const publicChange = options.getBoolean('public_change');
		const preferredName = options.getString('preferred_name');
		const user = await users.findOne({
			where: {
				name: interaction.user.username,
			},
		});
		if (!user) {
			await interaction.reply({ content: 'You are not registered.  Please register with Ralsei before setting your caretaker preferences.', ephemeral: true });
		}
		if (interaction.options.getSubcommand() === 'public_change') {
			if (publicChange != null) {
				await interaction.deferReply();
				await users.update({ publicChange: publicChange }, { where: { name: interaction.user.username } });
				await interaction.followUp({ content: 'Your public change preference has been updated.', ephemeral: true });
			}
		}
		if (interaction.options.getSubcommand() === 'preferred_name') {
			if (preferredName != null) {
				await interaction.deferReply();
				await users.update({ preferredName: preferredName }, { where: { name: interaction.user.username } });
				await interaction.followUp({ content: 'Your preferred name has been updated.', ephemeral: true });
			}
		}
	},
};