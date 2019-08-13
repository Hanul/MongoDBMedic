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
	
	// 2초에 한번씩 체크
	INTERVAL(2, RAR(() => {
		
		let nowCal = CALENDAR();
		
		if (
		isErrorOccured !== true &&
		
		// 예외 시간에 걸치지 않은 경우에만
		(
			config.exceptHourStart !== undefined &&
			config.exceptMinuteStart !== undefined &&
			config.exceptHourEnd !== undefined &&
			config.exceptMinuteEnd !== undefined &&
			
			(nowCal.getHour() > config.exceptHourStart || (nowCal.getHour() === config.exceptHourStart && nowCal.getMinute() >= config.exceptMinuteStart)) &&
			(nowCal.getHour() < config.exceptHourEnd || (nowCal.getHour() === config.exceptHourEnd && nowCal.getMinute() <= config.exceptMinuteEnd))
		) !== true) {
			
			GET(config.checkURL, {
				
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
	
	console.log(CONSOLE_GREEN('SkyMongoMedic이 실행중입니다...'));
});