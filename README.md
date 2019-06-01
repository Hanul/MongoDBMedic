# MongoDBMedic
[UPPERCASE의 분산 처리 환경](https://github.com/Hanul/UPPERCASE/blob/master/DOC/GUIDE/CLUSTERING.md)에서 몽고DB의 상태를 지속적으로 분석하여 이상 현상이 발생하는 경우 재시작해주는 솔루션

## 제한 사항
`forever`로 실행한 Node.JS 프로세스가 MongoDB와 같은 환경에서 실행되어 있어야 합니다.

## 설치하기
```
git clone https://github.com/Hanul/MongoDBMedic
```

## MongoDB 설정
```
sh.enableSharding('MongoDBMedicTest');

sh.shardCollection('MongoDBMedicTest.MongoDBMedic.Test', {_id : 1});
```

## 설정 (`config.json`)
```javascript
{
	"mongoPort" : 27018,
	"mongoDeamonCount" : 8,
	
	"testDBName" : "MongoDBMedicTest",
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
node MongoDBMedic.js
```
```
forever start MongoDBMedic.js
```

이제 MongoDB가 정상적으로 작동하지 않으면 MongoDB를 재시작하고, `forever restartall`을 수행한 뒤 다음과 같은 메일이 오게됩니다.

```
제목: My Server의 MongoDB에 이상 현상이 발생해 복구하였습니다.
내용: MongoDB에 이상 현상이 발생해 복구하였습니다.
My Server을(를) 체크하시기 바랍니다.
```

## 라이센스
[MIT](LICENSE)

## 작성자
[Young Jae Sim](https://github.com/Hanul)