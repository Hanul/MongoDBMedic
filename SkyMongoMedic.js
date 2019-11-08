require('uppercase-db');

BOX('UMAIL');

require('./UMAIL/NODE.js');

let exec = require('child_process').exec;

let run = (command, callback) => {
	
	exec(command, (error) => {
		if (error !== TO_DELETE) {
			SHOW_ERROR(command, error.toString());
		} else if (callback !== undefined) {
			callback();
		}
	});
};

let config = JSON.parse(READ_FILE({
	path : 'config.json',
	isSync : true
}));

CONNECT_TO_DB_SERVER({
	port : config.mongoPort,
	name : config.testDBName,
	username : config.testDBUsername,
	password : config.testDBPassword
});

BOX('SkyMongoMedic');

let testDB = SkyMongoMedic.DB('Test');

UMAIL.CONNECT_TO_MAIL_SERVER({
	host : config.mailHost,
	port : config.mailPort,
	isSecure : config.isMailSecure,
	username : config.mailUsername,
	password : config.mailPassword
}, (_sendMail) => {
	
	let sendMail = (title, content) => {
		_sendMail({
			senderName : config.mailSenderName,
			senderAddress : config.mailSenderAddress,
			receiverAddress : config.mailReceiverAddress,
			title : title,
			content : content + '\n\nBy https://github.com/Hanul/SkyMongoMedic'
		});
	};
	
	let isErrorOccured = false;
	
	// 2초에 한번씩 DB 체크
	INTERVAL(2, RAR(() => {
		
		if (isErrorOccured !== true) {
			
			testDB.get({
				
				notExists : () => {
					testDB.create({
						ping : 'pong'
					});
				},
				
				// 오류 발생!!
				error : () => {
					isErrorOccured = true;
					
					SHOW_ERROR('MongoDB에 이상 현상이 발생했습니다.');
					
					sendMail(config.serverName + '의 MongoDB에 이상 현상이 발생해 복구하였습니다.', 'MongoDB에 이상 현상이 발생해 복구하였습니다.\n' + config.serverName + '을(를) 체크하시기 바랍니다.');
					
					if (config.mongoDeamonCount === 1) {
						
						run('mongod --port 27018 --fork --logpath /var/log/mongodb.log --logappend --auth --bind_ip_all');
						
						DELAY(1, () => {
							
							console.log(CONSOLE_GREEN('복구를 완료하였습니다.'));
							
							// 모든 forever 데몬 재시작
							run('forever restartall');
						});
					}
					
					else {
						
						// DB 복구 절차 수행
						REPEAT(config.mongoDeamonCount, (i) => {
							let index = i + 1;
							
							run('mongod --shardsvr --port 3000' + index + ' --fork --keyFile /srv/mongodb/mongodb-shard-keyfile --logpath /var/log/mongo_shard_db' + index + '.log --dbpath /data/shard_db' + index);
						});
						
						DELAY(1, () => {
							
							// Config DB 복구 절차 수행
							[
								'mongod --configsvr --replSet csReplSet --port 40001 --fork --keyFile /srv/mongodb/mongodb-shard-keyfile --logpath /var/log/mongo_shard_config1.log --dbpath /data/shard_config1',
								'mongod --configsvr --replSet csReplSet --port 40002 --fork --keyFile /srv/mongodb/mongodb-shard-keyfile --logpath /var/log/mongo_shard_config2.log --dbpath /data/shard_config2',
								'mongod --configsvr --replSet csReplSet --port 40003 --fork --keyFile /srv/mongodb/mongodb-shard-keyfile --logpath /var/log/mongo_shard_config3.log --dbpath /data/shard_config3'
							].forEach(run);
						});
						
						DELAY(2, () => {
							
							// Mongos 복구 절차 수행
							run('mongos --port 27018 --fork --keyFile /srv/mongodb/mongodb-shard-keyfile --logpath /var/log/mongo_shard_mongos.log --configdb csReplSet/localhost:40001,localhost:40002,localhost:40003 --bind_ip_all');
						});
						
						DELAY(3, () => {
							
							console.log(CONSOLE_GREEN('복구를 완료하였습니다.'));
							
							// 모든 forever 데몬 재시작
							run('forever restartall');
						});
					}
				}
			});
		}
	}));
	
	console.log(CONSOLE_GREEN('SkyMongoMedic이 실행중입니다...'));
});