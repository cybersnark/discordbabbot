const { GlobalFonts } = require('@napi-rs/canvas');
const Canvas = require('@napi-rs/canvas');

async function characterMessage(interaction, text, background) {
	const aryText = text.split('\\n');
	GlobalFonts.registerFromPath('../font/DeterminationMonoWebRegular-Z5oq.ttf');
	const canvas = Canvas.createCanvas(909, 270);
	const context = canvas.getContext('2d');
	context.fillStyle = '#ffffff';
	const wetBackground = await Canvas.loadImage(background);
	context.drawImage(wetBackground, 0, 0, canvas.width, canvas.height);
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
	return attachmentImage;


}
module.exports = { characterMessage };