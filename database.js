const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	freezetableName: true,
	logging: false,
	// SQLite only
	storage: './db/babdb.sqlite',
});

module.exports = {
	userdb: sequelize.define('user', {
		name: {
			type: Sequelize.STRING,
			unique: true,
		},
		littleAge: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		preferredName: {
			type: Sequelize.STRING,
		},
		diaper247: {
			type: Sequelize.BOOLEAN,
			allowNuyll: false,
		},
		careTaker: {
			type: Sequelize.STRING,
			allowNull: false,
		},

	}),
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

	diapChangeTracker: sequelize.define('diaperchangetracker', {
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		previousBrand: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		brand: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		wet: {
			type: Sequelize.BOOLEAN,
		},
		messy: {
			type: Sequelize.BOOLEAN,
		},
		changetime: {
			type: Sequelize.DATE,
		},
	}),

	diapStatus: sequelize.define('diaperstatus', {
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		brand: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		wet: {
			type: Sequelize.STRING,
		},
		messy: {
			type: Sequelize.STRING,
		},
		booster: {
			type: Sequelize.BOOLEAN,
		},
		lastChange: {
			type: Sequelize.DATE,
		},
		lastUpdate: {
			type: Sequelize.DATE,
		},
	}),
	doSetup: function() {
		sequelize.sync();
	},
	doSave: function() {
		sequelize.save();
	},
};