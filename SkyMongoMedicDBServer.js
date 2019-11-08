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
		
		if (config.mongoDeamonCount === 1) {
			run('mongod --port 27018 --fork --logpath /var/log/mongodb.log --logappend --auth --bind_ip_all');
		}
		
		else {
			
			// DB 복구 절차 수행
			REPEAT(config.mongoDeamonCount, (i) => {
				let index = i + 1;
				
				run('mongod --shardsvr --port 3000' + index + ' --fork --keyFile /srv/mongodb/mongodb-shard-keyfile --logpath /var/log/mongo_shard_db' + index + '.log --dbpath /data/shard_db' + index);
			});
		}
		
		console.log(CONSOLE_GREEN('복구를 완료하였습니다.'));
		
		// 완료 반환
		response({
			isDone : true
		});
		
		return false;
	}
});

console.log(CONSOLE_GREEN('SkyMongoMedic이 실행중입니다...'));