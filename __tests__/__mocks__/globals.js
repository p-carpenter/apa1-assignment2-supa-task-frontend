// Mock global fetch and Response objects for Node.js testing environment
global.fetch = require('node-fetch');
global.Response = require('node-fetch').Response;
global.Request = require('node-fetch').Request;
global.Headers = require('node-fetch').Headers;
