const { GlobalFonts } = require('@napi-rs/canvas');
const Canvas = require('@napi-rs/canvas');
const wait = require('node:timers/promises').setTimeout;

module.exports = (client) => {
	client.ctMessage = async function({
		text:text,
		type:type,
		ephemeral:ephemeral,
		components:components,
		fetchReply:fetchReply,
		deleteReply:deleteReply,
		timeout:timeout,
		replace:replace,
	}, interaction) {
		let textData;
		let background;
		text.map((t) => {
			textData = t.text,
			background = t.image;
		});
		if (replace != null) {
			textData = textData.replace(replace[0], replace[1]);
		}

		const aryText = textData.split('\\n');
		GlobalFonts.registerFromPath('../font/DeterminationMonoWebRegular-Z5oq.ttf');
		const canvas = Canvas.createCanvas(909, 270);
		const context = canvas.getContext('2d');
		context.fillStyle = '#ffffff';
		const canvasBg = await Canvas.loadImage(background);
		context.drawImage(canvasBg, 0, 0, canvas.width, canvas.height);
		for (let i = 0; i < aryText.length; i++) {
			if (aryText[i].includes('*')) {
				context.font = '32px Determination Mono Web';
				aryText[i] = aryText[i].replace('*', '');
				context.fillText(aryText[i], 265, 83 + (i * 32), 603);
			}
			else {
				context.font = '28px Determination Mono Web';
				context.fillText(aryText[i], 265, 83 + (i * 28), 603);
			}

		}
		// context.fillText(stringLibrary.Characters.Ralsei.Change.status.self.wet.check.text, 270, 96, 603);
		const attachmentImage = await canvas.encode('webp');

		return client.characterMessage({
			files:[attachmentImage],
			components:components,
			type:type,
			fetchReply:fetchReply,
			deleteReply:deleteReply,
			ephemeral:ephemeral,
			timeout:timeout }, interaction);
	};


	client.characterMessage = async function({
		type:type,
		files:files,
		ephemeral:ephemeral,
		components:components,
		fetchReply:fetchReply,
		deleteReply:deleteReply,
		timeout:timeout }, interaction) {
		if (type === 'editreply') {
			return await interaction.editReply({
				files:files,
				components:components,
				ephemeral:ephemeral,
				fetchReply:fetchReply,
			}).then(async (msg) => {
				if (timeout !== null) {
					await wait(timeout * 1000);
				}
				if (deleteReply === true) {
					await interaction.deleteReply();
				}
			});
		}
		else if (type === 'reply') {
			return await interaction.reply({
				files:files,
				components:components,
				ephemeral:ephemeral,
				fetchReply:fetchReply,
			}).then(async (msg) => {
				if (timeout !== null) {
					await wait(timeout * 1000);
				}
				if (deleteReply === true) {
					await interaction.deleteReply();
				}
			});
		}
		else {
			return await interaction.followUp({
				files:files,
				components:components,
				ephemeral:ephemeral,
				fetchReply:fetchReply,
			}).then(async (msg) => {
				if (timeout !== null) {
					await wait(timeout * 1000);
				}
				if (deleteReply === true) {
					await interaction.deleteReply();
				}
			});
		}
	};
};