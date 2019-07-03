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
	host : config.mongoHost,
	port : config.mongoPort,
	name : config.testDBName,
	username : config.testDBUsername,
	password : config.testDBPassword
});

BOX('MongoDBMedic');

let testDB = MongoDBMedic.DB('Test');

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
			content : content + '\n\nBy https://github.com/Hanul/MongoDBMedic'
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
					
					// 복구 절차 수행
					
					// 우선 데이터베이스 서버들을 재시작합니다.
					EACH(config.dbServerHosts, (dbServerHost) => {
						
						POST({
							host : dbServerHost,
							port : config.medicPort,
							uri : 'recover',
							data : {
								password : config.medicPassword
							}
						}, (result) => {
							result = PARSE_STR(result);
							
							if (result.isDone === true) {
								
								// 이후 메인 데이터베이스 서버를 재시작합니다.
								POST({
									host : config.mongoHost,
									port : config.medicPort,
									uri : 'recover',
									data : {
										password : config.medicPassword
									}
								}, (result) => {
									result = PARSE_STR(result);
									
									if (result.isDone === true) {
										
										// 이후 앱 서버들을 재시작합니다.
										EACH(config.appServerHosts, (appServerHost) => {
											
											POST({
												host : appServerHost,
												port : config.medicPort,
												uri : 'recover',
												data : {
													password : config.medicPassword
												}
											});
										});
										
										// 마지막으로 현재 서버를 재시작합니다.
										
										console.log(CONSOLE_GREEN('복구를 완료하였습니다.'));
										
										// 모든 forever 데몬 재시작
										run('forever restartall');
									}
								});
							}
						});
					});
				}
			});
		}
	}));
	
	console.log(CONSOLE_GREEN('MongoDBMedic이 실행중입니다...'));
});