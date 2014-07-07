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
function load_routes(cb) {
	fs.readFile (
		args['routes-file'], { encoding: 'utf8' }, function(err, data) {
			if(err) {
				cb(err);
				return;
			}
			try {
				data = JSON.parse(data);
			}
			catch(err) {
				cb(err);
				return;
			}
			cb(null, data);
		}
	);
}
load_routes (
	function(err, routes) {
		if(err) {
			console.error("Failed to load routes:", err.message);
			if(args.forever) {
				console.log("Server will not start (But will poll file for updates.)");
			}
			return;
		}
		start_server(routes);
	}
);
function start_server(paths) {
	var app = express();
	app.use(express.logger());
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
				switch(err.code) {
					case 'ECONNREFUSED':
						res.send(521, "Server is down.");
						break;
					case 'ETIMEDOUT':
						res.send(522, "Connection timed out.");
						break;
					default:
						console.error("An unexpected connection error has occurred:", err);
						res.send(500, "Internal server error.");
						break;
				}
			}
		);
		req.pipe(target_req);
	}
	(function listen() {
		app.listen(args.port);
		console.log("Octopus server started on port", args.port + ".");
	})();
}
function stat_routes_file() {
	fs.stat (
		args['routes-file'], function(err, stats) {
			if(err) {
				set_stat_routes_file_timeout();
				return;
			}
			var mtime = stats.mtime.getTime();
			var last_mtime = stat_routes_file.last_mtime;
			if(mtime > last_mtime) {
				load_routes (
					function(err) {
						if(!err) {
							console.log("Newer valid routes file found. Quitting...");
							process.exit(0);
						}
						else {
							console.log("Newer routes file found, but load failed:", err.message);
							console.log("Ignoring...");
							set_stat_routes_file_timeout();
						}
					}
				);
			}
			else {
				set_stat_routes_file_timeout();
			}
			stat_routes_file.last_mtime = mtime;
		}
	);
}
stat_routes_file.last_mtime = fs.statSync(args['routes-file']).mtime.getTime();
function set_stat_routes_file_timeout() {
	setTimeout(stat_routes_file, 500);
}
if(args.forever) {
	set_stat_routes_file_timeout();
}
