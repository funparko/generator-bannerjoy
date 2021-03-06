var Generator = require('yeoman-generator');
var mkdirp = require('mkdirp');
var scrDir = 'src';
var adNetworks = [
	{value : 'adform', name : 'Adform'},
	{value : 'doubleclick', name : 'DoubleClick'},
	{value : 'adtomafusion', name : 'Adtoma Fusion'},
	{value : 'none', name : 'None'}
];


module.exports = class extends Generator {
	constructor (args, opts) {
		super(args, opts);
 	}

 	prompting () {
		var done = this.async();
			this.prompt([
			{
				type    : 'input',
				name    : 'width',
				message : 'Width:'
			},
			{
				type    : 'input',
				name    : 'height',
				message : 'Height:'
			},
			{
				type    : 'input',
				name    : 'name',
				message : 'Name (optional):'
			},
			{
				type: 'list',
				name: 'network',
				choices: adNetworks,
				message: 'Use an Ad-network?',
				default: 'none',
				store: true,
      		}
		]).then(function (answers) {
			this.width = parseInt(answers.width);
			this.height = parseInt(answers.height);
			this.size = answers.width + 'x' + answers.height;
			this.name = answers.name;
			this.network = answers.network;

			done();
		}.bind(this));
	}

  templates () {

		var data = {
			name: this.name,
			appName: this.config.get('name'),
			includeSass: this.config.get('includeSass'),
			network: this.network,
			clickTag: this.config.get('clickTag'),
			size: this.size,
			width: this.width,
			height: this.height
		};

		var name = this.name ? this.name.replace(/\s/, '_').toLowerCase() : '';
		var folderName = scrDir + '/' + this.size + (name.length > 0 ? '_' + name : '');

		this.fs.copyTpl(
			this.templatePath('index.html'),
			this.destinationPath(folderName + '/index.html'),
			data
		);

		if (data.network === 'adform') {
			this.fs.copyTpl(
				this.templatePath('manifest.json'),
				this.destinationPath(folderName + '/manifest.json'),
				data
			);
		}
		this.fs.copyTpl(
			this.templatePath('main.css'),
			this.destinationPath(folderName+ '/styles/main.' + (data.includeSass ? 'scss' : 'css')),
			data
		);
		this.fs.copyTpl(
			this.templatePath('main.js'),
			this.destinationPath(folderName + '/scripts/main.js'),
			data
		);

		mkdirp(folderName + '/images');

	}
};