# 使用官方的Node.js作为基础镜像
FROM node:20-alpine

# 设置工作目录为/usr/src/app
WORKDIR /usr/src/app

# 复制项目相关的文件到工作目录
COPY package.json ./
COPY model.js ./
COPY server.js ./

# 安装npm依赖
RUN npm install

# 设置容器的环境变量
ENV PORT=3001 SECRET=LuckySecret! MONGODB_USERNAME=Luckybird MONGODB_PASSWORD=luckypassword MONGODB_DATABASE=auth

# 暴露的端口号，应与你的应用实际监听的端口一致
EXPOSE 3001

# 设置默认启动命令
CMD [ "node", "server.js" ]