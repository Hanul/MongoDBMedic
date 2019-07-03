require('uppercase-core');

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

WEB_SERVER(config.medicPort, (requestInfo, _response) => {
	
	let uri = requestInfo.uri;
	let method = requestInfo.method;
	let data = requestInfo.data;
	
	if (data === undefined) {
		data = {};
	}
	
	let response = (data) => {
		_response({
			content : STRINGIFY(data),
			contentType : 'application/json',
			headers : {
				'Access-Control-Allow-Origin' : '*'
			}
		});
	};
	
	// 복구하라.
	if (uri === 'recover' && method === 'POST' && data.password === config.medicPassword) {
		
		SHOW_ERROR('복구 명령을 받았습니다.');
		
		console.log(CONSOLE_GREEN('복구를 완료하였습니다.'));
		
		// 모든 forever 데몬 재시작
		run('forever restartall');
	}
});

console.log(CONSOLE_GREEN('MongoDBMedic이 실행중입니다...'));