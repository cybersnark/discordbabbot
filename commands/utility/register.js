const { ActionRowBuilder, AttachmentBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, StringSelectMenuBuilder } = require('discord.js');
const stringLibrary = require('../../config/stringLibrary.json');
const database = require('../../database.js');
const { characterMessage } = require('../../functions/characterMessage.js');

const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Begins registration for a new user with Ralsei.'),
	async execute(interaction) {
		// Ralsei will almost always be the default caretaker here, as the user is not yet registered.
		const careTaker = 'Ralsei';

		// Shorten the stringLibrary.Characters[careTaker] to ctReg for brevity and readability.
		const ctReg = stringLibrary.Characters[careTaker].Register;
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
		const diaper247Check = new StringSelectMenuBuilder()
			.setCustomId('diaper247Check')
			.setPlaceholder('Do you wear 24/7?')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Yes')
					.setDescription('I wear 24/7')
					.setValue('true'),
				new StringSelectMenuOptionBuilder()
					.setLabel('No')
					.setDescription('I don\'t wear 24/7')
					.setValue('false'),
			);
		const row1 = new ActionRowBuilder()
			.addComponents(
				littleAgeMenu,
			);
		const row3 = new ActionRowBuilder()
			.addComponents(
				diaper247Check,
			);
		const ageFilter = i => {
			return i.customId === 'littleAgeMenu' && i.user.id === interaction.user.id;
		};
		const diaper247Filter = i => {
			return i.customId === 'diaper247Check' && i.user.id === interaction.user.id;
		};

		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		const user = await database.userdb.findOne({ where: { name: interaction.user.username } });
		let attachmentImage;
		let attachment;

		if (user) {
			attachmentImage = await characterMessage(ctReg.alreadyRegistered.text, ctReg.alreadyRegistered.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'alreadyRegistered.png' });
			const response = await interaction.reply({
				files: [attachment],
				ephemeral: true,
			});
		}
		else {
			attachmentImage = await characterMessage(ctReg.registerStart.text, ctReg.registerStart.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'registerStart.png' });
			const response = await interaction.reply({
				files: [attachment],
				ephemeral: true,
			});
			await wait(2_000);
			attachmentImage = await characterMessage(ctReg.name.text, ctReg.name.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'name.png' });
			let preferredName;
			await response.edit({
				files: [attachment],
				ephemeral: true,
				fetchReply: true,
			});
			try {
				const nameFilter = m => {

					return ((m.author.id === interaction.user.id) && (m.content.length >= 2 && m.content.length <= 64));
				};
				console.log('Awaiting preferred name');
				await interaction.channel.awaitMessages({ filter: nameFilter, max:1, time: 15_000, errors: ['time'] })
					.then(collected => {
						preferredName = collected.first().content;
						collected.first().delete();
						console.log('Got preferred name: ' + preferredName);
					});
			}
			catch (ex) {
				console.log(ex);
				preferredName = interaction.user.username;
			}
			attachmentImage = await characterMessage(ctReg.nameConfirm.text.replace('[name]', preferredName), ctReg.nameConfirm.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'nameConfirm.png' });
			await response.edit({ files: [attachment], components: [] });
			await wait(2_000);
			attachmentImage = await characterMessage(ctReg.littleAge.text, ctReg.littleAge.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'littleAge.png' });
			await response.edit(
				{
					files: [attachment],
					components: [row1],
					ephemeral: true,
				},
			);
			const ageCollector = await response.awaitMessageComponent({ filter: ageFilter, time: 60_000 });
			attachmentImage = await characterMessage(ctReg.littleAgeConfirm.text, ctReg.littleAgeConfirm.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'littleAgeConfirm.png' });
			await ageCollector.update({ files: [attachment], components: [] });
			await wait(2_000);
			attachmentImage = await characterMessage(ctReg.diaper247Check.text, ctReg.diaper247Check.image);
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
				attachmentImage = await characterMessage(ctReg.diaper247Confirm.text, ctReg.diaper247Confirm.image);
				attachment = new AttachmentBuilder(attachmentImage, { name: 'diaper247Confirm.png' });
				await diaper247Collector.update({ files: [attachment], components: [] });
			}
			else if (diaper247Collector.values[0] === false) {
				attachmentImage = await characterMessage(ctReg.diaper247NoDiapers.text, ctReg.diaper247NoDiapers.image);
				attachment = new AttachmentBuilder(attachmentImage, { name: 'diaper247NoDiapers.png' });
				await diaper247Collector.update({ files: [attachment], components: [] });
			}
			await wait(2_000);
			attachmentImage = await characterMessage(ctReg.registerFinish.text, ctReg.registerFinish.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'registerFinish.png' });
			await response.edit(
				{
					files: [attachment],
					ephemeral: true,
				},
			);
			await database.userdb.create({
				name: interaction.user.username,
				littleAge: ageCollector.values[0],
				preferredName: preferredName,
				diaper247: diaper247Collector.values[0],
				careTaker: careTaker,
			});
			attachmentImage = await characterMessage(ctReg.diaperReminder.text, ctReg.diaperReminder.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'diaperReminder.png' });
			await response.followup({
				files: [attachment],
				ephemeral: true,
			});
			await wait(30_000);
			await response.delete();
		}
	},
};