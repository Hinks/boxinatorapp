# boxinatorapp
Backend: Java using vertx Web and mysql.

Frontend reactjs together with redux, react-router, less-css

Requirements:
one database named boxinatordb and another named boxinatordbtest.
```console
mysql> create database boxinatordb;
mysql> create database boxinatordbtest;
```
Install instructions:<br />
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
7. 
Open top project folder(boxinatorapp) with IntelliJ IDEA<br />
8. Open src/main/resources/mysql.properties and add two lines:<br />
user=yourmysqlusername<br />
password=yourmysqluserpassword
<br />
<br />
9. 
Build Project(Ctrl+F9)<br />
10. Right-click on src/main/java/com/boxinatorapp/boxinatorapp/MainVerticle.java and select ‘Run MainVerticle.main()’



