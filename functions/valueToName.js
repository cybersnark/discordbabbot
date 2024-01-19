function valueToName(brand, quantity) {
	if (quantity === 1) {
		console.log(brand);
		return brand;
	}
	else if (brand.endsWith('s') || brand.endsWith('z')) {
		return brand;
	}
	else {
		return brand + 's';
	}
}
module.exports = { valueToName };