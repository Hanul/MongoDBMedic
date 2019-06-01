require('uppercase-db');

BOX('UMAIL');

require('./UMAIL/NODE.js');

let config = JSON.parse(READ_FILE({
	path : 'config.json',
	isSync : true
}));

CONNECT_TO_DB_SERVER({
	host : config.mongoHost,
	port : config.mongoPort,
	name : config.testDBName,
	username : config.testDBUsername,
	password : config.testDBPassword
});