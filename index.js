var lineReader = require('line-reader');
const chalk = require('chalk');

const reg = /(getThumbnailUrl\({)(.*)(}\))/;
const summary = {
	keys : [],
	params : {},
	counts : {}
};

const unimportant_key_values = [
	'height',
	'width',
	'quality',
	'opacity',
	'x',
	'y'
];

function cleanData(data){
	if(data === undefined ) { return; }
	return data.replace(/['"{}\[\])(]/g, '').trim();
}

function logProgress(row){
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write(`Processing Row ${row}`);
}

let rowCounter = 0;

if(process.argv[2] === undefined){
	console.log(chalk.magenta('Error file path is required'));
	process.exit(1);
}

console.log(chalk.blue('=====Starting====='));

lineReader.eachLine(process.argv[2], function(line, last) {
	rowCounter++;
	logProgress(rowCounter);
	const text = line.trim();
	const matches = text.match(reg);
	if(matches === null || matches[2] === undefined){ return; }

	const params = matches[2].split(',');
	params.forEach(function(param){
		const components = param.split(':');
		if(components.length < 2) { return; }
		const key = cleanData(components[0]);
		let value = cleanData(components[1]);

		if(key === 'sv'){
			value = cleanData(components.slice(1).join(':'));
		}

		if( !summary.keys.includes(key) ){
			summary.keys.push(key);
		}

		if( summary.counts[key] !== undefined ){
			summary.counts[key]++;
		}else{
			summary.counts[key] = 1;
		}

		if( !unimportant_key_values.includes(key) ){
			if( summary.params[key] !== undefined ){
				if( !summary.params[key].includes(value) ){
					summary.params[key].push(value);
				}
			}else{
				summary.params[key] = [value];
			}
		}
	});

	if(last){
		process.stdout.write(`\n`);
		console.log(chalk.blue("=====Complete===="));
		summary.keys.sort();
		Object.keys(summary.params).forEach(function(key){
			summary.params[key].sort();
		});
		console.log(chalk.blue("=====Summary===="));
		console.log(summary);
		console.log(chalk.blue('====Ending===='));
	}
});