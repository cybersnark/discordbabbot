const { ActionRowBuilder, AttachmentBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, StringSelectMenuBuilder, Client } = require('discord.js');
const stringLibrary = require('../../config/stringLibrary.json');
const database = require('../../database.js');
const { characterMessage, ctMessage } = require('../../functions/characterMessage.js');

const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Begins registration for a new user with Ralsei.'),
	async execute(interaction, client) {
		// Ralsei will almost always be the default caretaker here, as the user is not yet registered.
		const careTaker = 'Ralsei';

		// Shorten the stringLibrary.Characters[careTaker] to ctReg for brevity and readability.
		const ctReg = stringLibrary.Characters[careTaker].Register;
		// Create the select menus for the user to select their little age and whether they wear 24/7.
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
		// Create the action rows for the select menus to be placed in.
		const row1 = new ActionRowBuilder()
			.addComponents(
				littleAgeMenu,
			);
		const row3 = new ActionRowBuilder()
			.addComponents(
				diaper247Check,
			);
		// Create the filters for the select menus.
		const ageFilter = i => {
			return i.customId === 'littleAgeMenu' && i.user.id === interaction.user.id;
		};
		const diaper247Filter = i => {
			return i.customId === 'diaper247Check' && i.user.id === interaction.user.id;
		};

		// Check if the user is already registered.
		const user = await database.userdb.findOne({ where: { name: interaction.user.username } });
		let attachmentImage;
		let attachment;

		// If the user is already registered, send a message and delete it after 5 seconds.
		if (user) {
			/*
			attachmentImage = await characterMessage(ctReg.alreadyRegistered.text, ctReg.alreadyRegistered.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'alreadyRegistered.png' });
			await interaction.reply({
				files: [attachment],
				ephemeral: true,
			});
			*/

			await client.ctMessage({
				text:[ctReg.alreadyRegistered],
				type:'reply',
				components:[],
				ephemeral:true,
				fetchReply:false,
				deleteReply:true,
				timeout:5,
			}, interaction);
		}
		else {
			// If the user is not registered, begin the registration process.
			await client.ctMessage({
				text:[ctReg.registerStart],
				type:'reply',
				components:[],
				ephemeral:true,
				fetchReply:false,
				deleteReply:false,
				timeout:2,
			}, interaction);
			/*
			attachmentImage = await characterMessage(ctReg.registerStart.text, ctReg.registerStart.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'registerStart.png' });
			const response = await interaction.reply({
				files: [attachment],
				ephemeral: true,
			});
			await wait(2_000);
			*/
			await client.ctMessage({
				text:[ctReg.name],
				type:'editreply',
				components:[],
				ephemeral:true,
				fetchReply:true,
			}, interaction);
			/*
			attachmentImage = await characterMessage(ctReg.name.text, ctReg.name.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'name.png' });
			*/
			// Send the first message and wait for the user to respond with their preferred name.
			let preferredName;
			/*
			await response.edit({
				files: [attachment],
				ephemeral: true,
				fetchReply: true,
			});
			*/
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
				// If the user doesn't respond in time, use their username as their preferred name.
				// TODO: User should be able to change this later.
				console.log(ex);
				preferredName = interaction.user.username;
			}
			await client.ctMessage({
				text:[ctReg.nameConfirm],
				type:'editreply',
				components:[],
				ephemeral:true,
				fetchReply:true,
				timeout:2,
				replace:['[name]', preferredName],
			}, interaction);
			/*
			attachmentImage = await characterMessage(ctReg.nameConfirm.text.replace('[name]', preferredName), ctReg.nameConfirm.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'nameConfirm.png' });
			await response.edit({ files: [attachment], components: [] });
			await wait(2_000);
			*/

			// Send the next message and wait for the user to respond with their little age.

			await client.ctMessage({
				text:[ctReg.littleAge],
				type:'editreply',
				components:[row1],
				ephemeral:true,
				fetchReply:false,
				deleteReply:false,
			}, interaction);
			/*
			attachmentImage = await characterMessage(ctReg.littleAge.text, ctReg.littleAge.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'littleAge.png' });
			await response.edit(
				{
					files: [attachment],
					components: [row1],
					ephemeral: true,
				},
			);
			*/


			const ageCollector = await interaction.channel.awaitMessageComponent({ filter: ageFilter, time: 60_000, max:1 })
				.catch((e) => {
					console.log(e);
					return interaction.reply({ content: 'You didn\'t select an option in time!', ephemeral: true });
				});
			await ageCollector.deferUpdate();

			await client.ctMessage({
				text:[ctReg.littleAgeConfirm],
				type:'editreply',
				components:[],
				ephemeral:true,
				fetchReply:false,
				deleteReply:false,
				timeout:2,
			}, interaction);
			/*
			attachmentImage = await characterMessage(ctReg.littleAgeConfirm.text, ctReg.littleAgeConfirm.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'littleAgeConfirm.png' });
			await ageCollector.update({ files: [attachment], components: [] });
			await wait(2_000);
			*/
			// Send the next message and wait for the user to respond with whether they wear 24/7.

			await client.ctMessage({
				text:[ctReg.diaper247Check],
				type:'editreply',
				components:[row3],
				ephemeral:true,
				fetchReply:false,
				deleteReply:false,
				timeout:1,
			}, interaction);
			/*
			attachmentImage = await characterMessage(ctReg.diaper247Check.text, ctReg.diaper247Check.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'diaper247Check.png' });
			await response.edit(
				{
					files: [attachment],
					components: [row3],
					ephemeral: true,
				},
			);
			*/
			const diaper247Collector = await interaction.channel.awaitMessageComponent({ filter: diaper247Filter, time: 60_000, max:1 })
				.catch((e) => {
					console.log(e);
					return interaction.reply({ content: 'You didn\'t select an option in time!', ephemeral: true });
				});
			await diaper247Collector.deferUpdate();
			if (diaper247Collector.values[0] === 'true') {
				/*
				attachmentImage = await characterMessage(ctReg.diaper247Confirm.text, ctReg.diaper247Confirm.image);
				attachment = new AttachmentBuilder(attachmentImage, { name: 'diaper247Confirm.png' });
				await diaper247Collector.update({ files: [attachment], components: [] });
				*/
				await client.ctMessage({
					text:[ctReg.diaper247Confirm],
					type:'editreply',
					components:[],
					ephemeral:true,
					fetchReply:false,
					deleteReply:false,
					timeout:2,
				}, interaction);
			}
			else if (diaper247Collector.values[0] === 'false') {
				await client.ctMessage({
					text:[ctReg.diaper247Deny],
					type:'editreply',
					components:[],
					ephemeral:true,
					fetchReply:false,
					deleteReply:false,
					timeout:2,
				}, interaction);
			}
			/*
			* It would be nice if we could ask the user what they're currently wearing so we could create a diaperStatus entry for them here.
			* This is made difficult by the fact that we cannot use AutoComplete for this kind of response.
			* Using a SelectMenu would have us limited to 25 options, which is not enough for the number of brands we have.
			* We could use a slashcommand, but that would require more manual input from the user and would feel kind of clunky.
			* Instead, let's encourage the user to update their stash and status at the end of the registration process.
			*/
			/*
			attachmentImage = await characterMessage(ctReg.registerFinish.text, ctReg.registerFinish.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'registerFinish.png' });
			await response.edit(
				{
					files: [attachment],
					ephemeral: true,
				},
			);
			*/
			await client.ctMessage({
				text:[ctReg.registerFinish],
				type:'editreply',
				components:[],
				ephemeral:true,
				fetchReply:false,
				deleteReply:false,
				timeout:2,
			}, interaction);
			await database.userdb.create({
				name: interaction.user.username,
				littleAge: ageCollector.values[0],
				preferredName: preferredName,
				diaper247: diaper247Collector.values[0],
				careTaker: careTaker,
			});
			await wait(1_500);
			/*
			attachmentImage = await characterMessage(ctReg.diaperReminder.text, ctReg.diaperReminder.image);
			attachment = new AttachmentBuilder(attachmentImage, { name: 'diaperReminder.png' });
			await response.edit({
				files: [attachment],
				ephemeral: true,
			});
			*/
			await client.ctMessage({
				text:[ctReg.diaperReminder],
				type:'editreply',
				components:[],
				ephemeral:true,
				fetchReply:false,
				deleteReply:true,
				timeout:30,
			}, interaction);
			// await response.delete();
		}
	},
};