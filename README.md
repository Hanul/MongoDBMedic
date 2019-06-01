# MongoDBMedic
[UPPERCASE의 분산 처리 환경](https://github.com/Hanul/UPPERCASE/blob/master/DOC/GUIDE/CLUSTERING.md)에서 몽고DB의 상태를 지속적으로 분석하여 오류가 발생하는 경우 재시작해주는 솔루션

## 설치하기
```
git clone https://github.com/Hanul/MongoDBMedic
```

## 설정 (`config.json`)
```javascript
{
	"mongoDeamonCount" : 8,
	"mongoPort" : 27018,
	
	"testDBName" : "test",
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
제목: My Server의 MongoDB가 정상적으로 작동하지 않아 재시작하였습니다.
내용: MongoDB가 정상적으로 작동하지 않아 재시작하였습니다.
My Server을(를) 체크하시기 바랍니다.
```

## 라이센스
[MIT](LICENSE)

## 작성자
[Young Jae Sim](https://github.com/Hanul)