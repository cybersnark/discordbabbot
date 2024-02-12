const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: './db/babdb.sqlite',
	define: {
		timestamps: false,
		freezeTableName: true,
	},
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
			allowNull: false,
		},
		careTaker: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		publicChange: {
			type: Sequelize.BOOLEAN,
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
			type: Sequelize.STRING,
		},
		messy: {
			type: Sequelize.STRING,
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
};