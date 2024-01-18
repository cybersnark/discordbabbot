module.exports = (client) => {
	client.valueToName = async function(brand, quantity) {
		if (quantity === 1) {
			return brand;
		}
		else
			if (brand.endsWith('s') || brand.endsWith('z')) {
				return brand;
			}
			else {
				return brand + 's';
			}
	};
};