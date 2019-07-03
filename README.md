# SkyMongoMedic
[UPPERCASE의 분산 처리 환경](https://github.com/Hanul/UPPERCASE/blob/master/DOC/GUIDE/CLUSTERING.md)에서 몽고DB의 상태를 지속적으로 분석하여 이상 현상이 발생하는 경우 재시작해주는 솔루션

## 제한 사항
`forever`로 실행한 Node.JS 프로세스가 MongoDB와 같은 환경에서 실행되어 있어야 합니다.

## 설치하기
```
git clone https://github.com/Hanul/SkyMongoMedic
```

## MongoDB 설정
우선 SkyMongoMedicTest 데이터베이스를 생성합니다. 이후 아래 명령을 실행합니다.

```
sh.enableSharding('SkyMongoMedicTest');

sh.shardCollection('SkyMongoMedicTest.SkyMongoMedic.Test', {_id : 1});
```

## 설정 (`config.json`)
```javascript
{
	"mongoPort" : 27018,
	"mongoDeamonCount" : 8,
	
	"testDBName" : "SkyMongoMedicTest",
	"testDBUsername" : "test",
	"testDBPassword" : "test123",
	
	"mailHost" : "smtp.gmail.com",
	"mailPort" : 465,
	"isMailSecure" : true,
	"mailUsername" : "sender@hanul.me",
	"mailPassword" : "ENTER YOUR PASSWORD",
	
	"mailSenderName" : "BTNcafe Contact",
	"mailSenderAddress" : "sender@hanul.me",
	"mailReceiverAddress" : "hanul@hanul.me",
	
	"serverName" : "My Server"
}
```

## 실행
```
node SkyMongoMedic.js
```
```
forever start SkyMongoMedic.js
```

이제 MongoDB가 정상적으로 작동하지 않으면 MongoDB를 재시작하고, `forever restartall`을 수행한 뒤 다음과 같은 메일이 오게됩니다.

```
제목: My Server의 MongoDB에 이상 현상이 발생해 복구하였습니다.
내용: MongoDB에 이상 현상이 발생해 복구하였습니다.
My Server을(를) 체크하시기 바랍니다.
```

## 분산 서버 환경인 경우
`config.json` 설정 파일에 아래와 같이 몇 가지 정보들을 추가합니다.

- `mongoHost` mongos의 호스트를 입력합니다.
- `medicPort` SkyMongoMedic이 서로 연결될 포트 번호입니다.
- `medicPassword` SkyMongoMedic이 통신할 때 사용되는 비밀번호입니다.
- `appServerHosts` **메인 서버를 제외한** 앱 서버들의 호스트들을 입력합니다.
- `dbServerHosts` **`mongoHost`를 제외한** 데이터베이스 서버들의 호스트들을 입력합니다.

```
"mongoHost" : "11.11.11.13",

"medicPort" : 8973,
"medicPassword" : "THIS IS PASSWORD",

"appServerHosts" : [
	"11.11.11.12"
],
"dbServerHosts" : [
	"11.11.11.14"
]
```

이후 앱 서버들 중 메인 서버가 되는 서버에서는 `SkyMongoMedicAppMainServer.js`를, 나머지 앱 서버들에서는 `SkyMongoMedicAppServer.js`를 실행합니다.

또한 `mongoHost` 서버에서는 `SkyMongoMedicDBMainServer.js`를, 나머지 데이터베이스 서버들에서는 `SkyMongoMedicDBServer.js`를 실행합니다.

## 라이센스
[MIT](LICENSE)

## 작성자
[Young Jae Sim](https://github.com/Hanul)