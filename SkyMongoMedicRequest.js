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
	
	let check = (checkURL, callback) => {
		
		// 오류 발생
		let occureError = () => {
			
			if (isErrorOccured !== true) {
				isErrorOccured = true;
				
				SHOW_ERROR('MongoDB에 이상 현상이 발생했습니다.');
				
				sendMail(config.serverName + '의 MongoDB에 이상 현상이 발생해 복구하였습니다.', 'MongoDB에 이상 현상이 발생해 복구하였습니다.\n' + config.serverName + '을(를) 체크하시기 바랍니다.');
				
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
		};
		
		let isRespond = false;
		
		let response = () => {
			
			if (isRespond !== true) {
				
				isRespond = true;
				
				if (callback !== undefined) {
					callback();
				}
			}
		};
		
		// 5초 이상 응답없으면 실행
		DELAY(5, () => {
			
			if (isRespond !== true) {
				occureError();
				response();
			}
		});
		
		GET(checkURL, {
			
			success : response,
			
			// 오류 발생!!
			error : (errorMsg, statusCode) => {
				
				// 500 오류 발생 시에만 복구
				if (statusCode === 500) {
					occureError();
				}
				
				response();
			}
		});
	};
	
	// 2초에 한번씩 체크
	INTERVAL(2, () => {
		
		let nowCal = CALENDAR();
		
		if (
		// 예외 시간에 걸치지 않은 경우에만
		(
			config.exceptHourStart !== undefined &&
			config.exceptMinuteStart !== undefined &&
			config.exceptHourEnd !== undefined &&
			config.exceptMinuteEnd !== undefined &&
			
			(nowCal.getHour() > config.exceptHourStart || (nowCal.getHour() === config.exceptHourStart && nowCal.getMinute() >= config.exceptMinuteStart)) &&
			(nowCal.getHour() < config.exceptHourEnd || (nowCal.getHour() === config.exceptHourEnd && nowCal.getMinute() <= config.exceptMinuteEnd))
		) !== true) {
			
			if (CHECK_IS_ARRAY(config.checkURL) === true) {
				NEXT(config.checkURL, check);
			} else {
				check(config.checkURL);
			}
		}
	});
	
	console.log(CONSOLE_GREEN('SkyMongoMedic이 실행중입니다...'));
});