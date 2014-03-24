#!/usr/bin/env node
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
var fs = require('fs');
var http = require('http');
var url = require('url');
var express = require('express');
var args = require('./src/arguments');
var app = express();
app.use(express.logger());
var paths = (function() {
	try {
		return JSON.parse(fs.readFileSync(args['routes-file'], 'utf8'));
	}
	catch(err) {
		console.error("Could not parse or open routes-file:", err.message);
		process.exit(-1);
	}
})();
fs.watch (
	args['routes-file'], function() {
		console.log("'" + args['routes-file'] + "' changed. Quitting...");
		process.exit(0);
	}
);
for(var path in paths) {
	var target = paths[path];
	app.use(path, route.bind(null, target));
}
function route(target, req, res) {
	var request_tail = req.url;
	if(request_tail === '/' && req.originalUrl[req.originalUrl.length - 1] !== '/') {
		request_tail = '';
	}
	target = url.parse(target + request_tail);
	var target_req = http.request ({
		hostname: target.hostname
		, port: target.port
		, auth: target.auth
		, method: req.method
		, path: target.path
		, headers: req.headers
	});
	target_req.once (
		'response', function(target_res) {
			res.status(target_res.statusCode);
			res.set(target_res.headers);
			target_res.pipe(res);
		}
	);
	target_req.on (
		'error', function(err) {
			res.status(500);
			res.send(err);
		}
	);
	req.pipe(target_req);
}
(function start() {
	app.listen(args.port);
	console.log("Octopus server started on port", args.port + ".");
})();
