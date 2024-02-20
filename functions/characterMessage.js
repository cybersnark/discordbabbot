const { GlobalFonts } = require('@napi-rs/canvas');
const Canvas = require('@napi-rs/canvas');
const wait = require('node:timers/promises').setTimeout;

module.exports = (client) => {
	client.ctMessage = async function({
		// The text to display.  Takes a JSON key from stringLibrary.  Should reference the root key and not the .text key (i.e. stringLibrary.Characters.Ralsei.Register.RegisterStart).
		text:text,
		// The type of message to send.  Can be 'reply', 'editreply', or 'followup'.
		type:type,
		// Whether the message should be ephemeral or not.  Defaults to false.
		ephemeral:ephemeral,
		// The components to add to the message.  Defaults to an empty array.
		components:components,
		// Whether to fetch the reply or not.  Defaults to false.
		fetchReply:fetchReply,
		// Whether to delete the reply or not.  Defaults to false.
		deleteReply:deleteReply,
		// How long will the message sit before moving on.  Defaults to null.
		timeout:timeout,
		// If any parts of a string need to be replaced, we can do this here.  Takes two parameters: the text to replace (i.e. '[name]') and the replacement (i.e. 'Ralsei').
		replace:replace,
	}, interaction) {
		// Since we're loading the JSON key that contains both the .text and .image keys, we need to map through the array to get the data we need.
		let textData;
		let background;
		text.map((t) => {
			textData = t.text,
			background = t.image;
		});
		// If we need to replace any part of the string, we can do that here.
		if (replace != null) {
			textData = textData.replace(replace[0], replace[1]);
		}
		// Split the text into an array of strings, separated by newlines.
		const aryText = textData.split('\\n');
		GlobalFonts.registerFromPath('../font/DeterminationMonoWebRegular-Z5oq.ttf');
		const canvas = Canvas.createCanvas(909, 270);
		const context = canvas.getContext('2d');
		// TODO: We should be able to change the color of the text here.  Might be able to let the user specify their preferred color as well.
		context.fillStyle = '#ffffff';
		const canvasBg = await Canvas.loadImage(background);
		context.drawImage(canvasBg, 0, 0, canvas.width, canvas.height);
		// Instead of using static text sizes, we can also allow ctMesssage to take a text size parameter.  From there, we can use * to denote a larger text size and increase the font size by 4px.
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
		const attachmentImage = await canvas.encode('webp');
		// Return the message to the user after passing these parameters to client.characterMessage.

		return client.characterMessage({
			files:[attachmentImage],
			components:components,
			type:type,
			fetchReply:fetchReply,
			deleteReply:deleteReply,
			ephemeral:ephemeral,
			timeout:timeout }, interaction);
	};

	// TODO: Should we rename characterMessage to something else?  It's a bit misleading.
	client.characterMessage = async function({
		type:type,
		files:files,
		ephemeral:ephemeral,
		components:components,
		fetchReply:fetchReply,
		deleteReply:deleteReply,
		timeout:timeout }, interaction) {
		// If the type is editreply, we'll edit the reply.  If it's reply, we'll send a new reply.  If it's followup or anything else, we'll send a followup message.
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