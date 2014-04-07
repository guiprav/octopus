Octopus
=======

Octopus is a web gateway (a kind of proxy) that allows different HTTP servers to serve content using the port it listens on.

Given a routes JSON file upon start, Octopus will listen to HTTP requests and, based on the request host (domain + subdomain) and/or on the start of the URL path, determine what HTTP server should handle that request.

To exemplify, given the following JSON file:

    // routes.json
    {
        // Route:              Responsible server protocol, host, and port:
        "/some/node/app":      "http://localhost:81"
        , "/another/node/app": "http://localhost:82"
        , "/php/apps":         "http://localhost:83"
        , "/":                 "http://localhost:84"
    }

And by running:

    $ octopus routes.json -p 80

Octopus would listen on port 80 for HTTP requests and inspect the start of URL paths, looking for a match in `routes.json`. When found (e.g. request was `GET /some/node/add/do-something`,) a localhost connection to the appropriate web server would be made (i.e. http://localhost:81,) and all request headers & all further communication would be relayed between the connecting and web server peers. When not found, a configurable 404 page is served.

_The route string can also contain a host to match against requests._ That route thus only matches if the request `Host` header matches. E.g.:

    {
        "/@supernifty.com": "http://localhost:81"
        , "/@forum.supernifty.com": "http://localhost:82"
    }

Since the path is `/` (root) for both routes, the deciding factor there is just the requested host string. Mixing base paths and hosts is (hopefully) intuitive enough.

_Routes are matched in order,_ so in case ambiguous routes are present, the first one matched is always used.

Danger, Will Robinson! Danger!
------------------------------

Care should be taken when serving multiple web servers via the same domain (host) name. This should only be used if all web servers under the same domain are mutually trustful and will be careful not to, among other things, unwillingly destroy or be confused by each others cookies.

Remember, browser cookies work on a per-host + port + protocol basis. That combination is called an "origin." Even if two different servers are actually serving the requests via Octopus, to the browser, it all looks like a single server.

Also remember the trust relationships between domains and its subdomains is also tricky matter. As a matter of fact, I haven't studied it properly myself yet.

As a general rule, don't use Octopus if you don't understand the implications of same-origin browser security policies, how domains and subdomains relate from a security point-of-view and how all that affects your website security.

Copying
-------

![](https://www.gnu.org/graphics/agplv3-155x51.png)

Octopus is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Unfriendliness with the proprietary paradigm is intentional. If you're writing proprietary software, please consider [respecting your users' freedom instead.](https://www.gnu.org/philosophy/free-sw.html)

Exclusion of warranty
---------------------

Octopus is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

A copy of AGPLv3 can be found in [COPYING.](COPYING)
