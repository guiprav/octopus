var defaults = {};
defaults.port = 3000;
var parsed = require('minimist')(process.argv.slice(2));
var log = console.log;
function print_usage() {
	log("Usage: octopus [option]... routes-file");
	log();
	log("routes-file: Path to a JSON file.");
	log("    Format:");
	log('        { "/route-1": "http://localhost:81"');
	log('          , "/route-2": "http://localhost:82"');
	log('          , "/": "http://localhost:83"');
	log('          , etc... }'); 
	log();
	log("Routes are tried in order. Target is resolved on first matched route.");
	log();
	log("Options:");
	log("    -p, --port: Listening port to serve from.");
	log("        Default:", defaults.port);
	log();
	process.exit(0);
}
if(parsed.h !== undefined || parsed.help !== undefined) {
	print_usage();
}
var args = {};
for(var name in defaults) {
	args[name] = defaults[name];
}
function bad_args() {
	log("Type octopus -h or --help for usage.");
	log();
	process.exit(-1);
}
function ensure_not_boolean(name, value) {
	if(typeof(value) === 'boolean') {
		console.error("Error:", name, "is not a flag.");
		bad_args();
	}
}
for(var name in parsed) {
	var value = parsed[name];
	switch(name) {
		case '_':
			if(value.length > 1) {
				console.error("More than one path supplied for routes-file.");
				bad_args();
				break;
			}
			args['routes-file'] = value[0];
			break;

		case 'p':
		case 'port':
			ensure_not_boolean('-p / --port', value);
			args.port = value;
			break;
		default:
			console.error("Unrecognized option: '" + name + "'.");
			bad_args();
			break;
	}
}
if(!args['routes-file']) {
	console.error("Missing routes-file.");
	bad_args();
}
module.exports = args;
