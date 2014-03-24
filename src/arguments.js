/*
	Copyright (c) 2014 Guilherme Prá Vieira

	This file is part of Octopus.

	Octopus is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as
	published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.

	Octopus is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public
	License along with Octopus. If not, see <http://www.gnu.org/licenses/>.
*/
var defaults = {};
defaults.forever = false;
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
		case 'forever':
			args.forever = value;
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
