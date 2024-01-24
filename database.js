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
		lastChange: {
			type: Sequelize.DATE,
		},
		lastUpdate: {
			type: Sequelize.DATE,
		},
	}),

	brandList: sequelize.define('brandlist', {
		brand: {
			type: Sequelize.STRING,
			unique: true,
			allowNull: false,
		},
		pluralName: {
			type: Sequelize.STRING,
			unique: true,
		},
	}),

	doSetup: function() {
		const brands = ['PeekABU', 'Space', 'Simple', 'Super Dry Kids', 'Little Pawz', 'PreSchool', 'Cushies', 'BunnyHopps', 'DinoRawrZ', 'Little Kings', 'AlphaGatorz', 'Kiddo', 'Tiny Tails', 'Overnights', 'Cammies', 'Galactic', 'Unicorn', 'Little Rawrs', 'Waddler', 'Puppers', 'Animooz', 'Camelot', 'Str8up', 'Trest Elite', 'Classico', 'Bianco', 'Magnifico', 'Bellissimo', 'Safari', 'Princess Pink'];
		const brandPlural = ['PeekABUs', 'Spaces', 'Simples', 'Super Dry Kids', 'Little Pawz', 'PreSchools', 'Cushies', 'BunnyHopps', 'DinoRawrZ', 'Little Kings', 'AlphaGatorz', 'Kiddos', 'Tiny Tails', 'Overnights', 'Cammies', 'Galactics', 'Unicorns', 'Little Rawrs', 'Waddlers', 'Puppers', 'Animooz', 'Camelots', 'Str8ups', 'Trest Elites', 'Classicos', 'Biancos', 'Magnificos', 'Bellissimos', 'Safaris', 'Princess Pinks'];

		sequelize.sync();
		for (const brand of brands) {
			this.brandList.create({
				brand: brand,
				pluralName: brandPlural[brand],
			});
		}
		this.brandList.sync();
	},
};