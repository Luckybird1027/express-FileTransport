# express-FileTransport
express.js个人练习项目——web文件后端服务器



## 这是什么

该项目是一个基于**express.js**和**Mongodb**的web文件**后端应用**，用户可以注册、登录账户，登录用户可以上传和下载文件，而未登录用户只能下载文件。该项目为纯后端项目，无前端页面。



## 基本功能

1. **用户系统**：用户可以注册和登录。注册时，用户需要提供用户名和密码，这些信息将被存储在数据库中。登录功能则验证提供的用户民告和密码，登录成功后，系统向客户端发放Token。
2. **文件上传与下载**：已登录的用户可以上传文件到服务器，而非注册用户只能下载文件。
3. **用户鉴权**：项目使用JWT（JSON Web Tokens）进行用户鉴权。JWT存储在Auth headers中，用于验证用户的身份和权限。



## 如何部署

### 手动部署

**确保安装了node.js**

```
node -v
npm -version
```

下载地址：[Node.js — 在任何地方运行 JavaScript (nodejs.org)](https://nodejs.org/zh-cn)



**确保安装了Mongodb**

```
mongod --version
```

下载地址：[Download MongoDB Community Server | MongoDB](https://www.mongodb.com/try/download/community)



**安装项目依赖**

在项目根目录下（与`package.json`同级）

```
npm install
```

如果安装依赖过慢或失败，可以尝试使用科学上网或使用npm镜像站



**更改项目配置**

在`server.js`和`model.js`处更改应用开放的端口、jwt验证密钥，mongodb连接的用户名、密码、所连接的数据库以及连接字符串等。



**启动项目**

在项目根目录下

```
node server.js
```

应用默认开放3001端口，可通过[http://localhost:3001](http://localhost:3001/)来测试服务器是否正常运行。



### docker部署

目前仅支持手动构建并运行应用

**确保安装了docker**

```
docker --version
```

下载地址：[Docker: Accelerated Container Application Development](https://www.docker.com/)



**更改项目配置**

在`server.js`、`model.js`、`dockerfile`、`docker-compose.yml`处更改应用开放的端口、jwt验证密钥，mongodb容器中的root用户的用户名、密码，mongodb连接的用户名、密码、所连接的数据库以及连接字符串。



**构建并运行应用**

在根目录下（与`dockerfile`和`docker-compose.yml`同级）

```
docker compose up --build
```

应用默认开放3001端口，可通过[http://localhost:3001](http://localhost:3001/)来测试服务器是否正常运行。



## TODO

用express.js写一个后端服务器应用

- [x] 包含用户系统，可以注册，登录
- [x] 用户可以上传文件，非用户只能下载
- [x] 用户鉴权可使用jwt，可以存在Cookies或Auth headers里
- [x] 支持使用docker部署
