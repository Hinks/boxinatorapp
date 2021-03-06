# boxinatorapp
Backend: Java using vertx Web and mysql.<br />
Frontend reactjs together with redux, react-router, material-ui

**Requirements**:<br />
Java jdk 8+ <br />
Node.js v9.5.0+ and npm v5.6.0+<br />
MySQL Community Server v5+

One database named boxinatordb and another named boxinatordbtest.
```console
mysql> create database boxinatordb;
mysql> create database boxinatordbtest;
```
**Install instructions**:<br />
1.
```console
foo@bar:~$ git clone <this-project>
```
2.
```console
foo@bar:~$ cd boxinatorapp
```
3.
```console
foo@bar:~/.../boxinatorapp$ touch src/main/resources/mysql.properties
```
4.
```console
foo@bar:~/.../boxinatorapp$ cd src/main/resources/webroot/boxinator-client
```
5.
```console
foo@bar:~/.../boxinatorapp/src/main/resources/webroot/boxinator-client$ npm install
```
6.
```console
foo@bar:~/.../boxinatorapp/src/main/resources/webroot/boxinator-client$ npm run build
```
7. Open project folder(boxinatorapp) with IntelliJ IDEA<br />
8. Open src/main/resources/mysql.properties and add two lines:<br />
user=yourmysqlusername<br />
password=yourmysqluserpassword<br />
9. Build Project(Ctrl+F9)<br />
10. Right-click on src/main/java/com/boxinatorapp/boxinatorapp/MainVerticle.java and select ‘Run MainVerticle.main()’
11. Last line in the IntelliJ console should be:<br />
INFO: Succeeded in deploying verticle<br />
12. Open a browser and go to http://localhost:8080/ to try out the app! 

Index:
--
![](docs/indexpage.png)
---
Add view: 
--
![](docs/addbox.png)
---
List view:
--
![](docs/listboxes.png)




