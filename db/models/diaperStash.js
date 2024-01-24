const Sequelize = require('sequelize');
module.exports = {
	diapStash: sequelize.define('diaperstash', {
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
	}),
};