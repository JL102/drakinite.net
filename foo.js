const express = require('express');
const HttpProxy = require('http-proxy');

const app = express();
const proxy = HttpProxy.createProxyServer({});

app.use((req, res) => {
	proxy.web(req, res, {
		target: 'http://localhost:11000',
		timeout: 1000 * 60 * 3,
		proxyTimeout: 1000 * 60 * 3,
		ws: true,
		followRedirects: true,
		autoRewrite: true,
	});
});