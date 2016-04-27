// Huron loader
//
// Performs one simple function:
// inserting static paths so webpack can statically analyze html templates and source CSS

var path = require('path');
var fs = require('fs');

module.exports = function(source, map) {
	var huron = this.options.huron;
	var templatePathArray = [];
	var templateIds = [];

	// Read the destination dir
	var templates = fs.readdirSync(huron.destination);

	// Generate a list of paths and IDs for all templates
	templates.forEach(file => {
		templatePathArray.push(
			`'${path.join(huron.root, huron.destination, file)}'`
		);
		templateIds.push(file.replace('.html', ''));
	});

	// Initialize templates object and HMR acceptance logic
	var prependText = [
		`const templates = {};`,
		`const css = []`,
		`if (module.hot) {`,
		  `module.hot.accept(`,
		    `[${templatePathArray}],`,
		    `update => {`,
		    	`let updatedModules = Object.keys(update);`,
		    	`if (updatedModules.length) {`,
		      		`let template = __webpack_require__(update[updatedModules[0]][0]);`,
		      		`templateReplaceCallback(template);`,
		      	`}`,
		    `}`,
		  `);`,
		`}`,
	];

	// Generate templates object using template IDs as keys
	templatePathArray.forEach((template, idx) => {
		prependText.push(
			`templates['${templateIds[idx]}'] = require(${template});`
		);
	});

	huron.css.forEach((css) => {
		prependText.push(
			`css.push(require('${path.join(huron.root, css)}'));`
		)
	});

	return [
		prependText.join('\n'),
		source
	].join('\n');
}