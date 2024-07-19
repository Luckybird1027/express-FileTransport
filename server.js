const { User } = require("./model")
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const SECRET = 'LuckySecret!'

const app = express()
app.use(express.json())

// GET /api/users路由 返回所有用户
app.get("/api/users", async (req, res) => {
    const users = await User.find()
    res.send(users)
    console.log(users)
})

// POST /api/register路由 注册用户
app.post("/api/register", async (req, res) => {
    try {
        const user = await User.create({
            username: req.body.username,
            password: req.body.password,
        });
        res.status(201).send(user); // 201是Created状态码，表示资源已被创建
    } catch (error) {
        if (error.name === 'MongooseError' && error.code === 11000) {
            // 11000是MongoDB的重复键错误代码
            res.status(400).send({ error: 'Username already exists' }); // 400是Bad Request状态码
        } else {
            console.error('An error occurred:', error);
            res.status(500).send({ error: 'Internal Server Error' }); // 500是Internal Server Error状态码
        }
    }
});

// POST /api/login路由 登录用户
app.post("/api/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        // 先判断用户名是否存在
        if (!user) {
            console.log(req.body.username + " not found!");
            return res.status(422).send({ error: 'Invalid username or password' }); // 422是Unprocessable Entity状态码
        }
        // 再判断密码是否正确
        const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
        if (!isPasswordValid) {
            console.log(req.body.username + " password Invalid!");
            return res.status(422).send({ error: 'Invalid username or password' }); // 422是Unprocessable Entity状态码
        }
        console.log(req.body.username + " Login success!");
        // 登录成功，返回user，生成token并返回
        const token = jwt.sign({
            id: String(user._id)
        }, SECRET)
        res.send({
            user,
            token: token
        })
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send({ error: 'Internal Server Error' }); // 500是Internal Server Error状态码
    }
});

// authenticateToken中间件 将Token验证到req.user
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.log("No authorization header");
        return res.status(401).send({ error: 'No authorization header' });
    }

    const tokenParts = authHeader.trim().split(' ');

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        console.log("Invalid authorization header");
        return res.status(401).send({ error: 'Invalid authorization header' });
    }

    const rawToken = tokenParts[1];

    try {
        const { id } = jwt.verify(rawToken, SECRET);
        const user = await User.findById(id);

        if (!user) {
            console.log("User not found by Token");
            return res.status(404).send({ error: 'User not found' });
        }

        console.log(user.username + " found by Token");
        req.user = user; // 将用户信息附加到请求对象上
        next(); // 验证成功，继续处理其他中间件或路由处理程序

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            console.log("Invalid token");
            return res.status(401).send({ error: 'Invalid token' });
        }

        console.error('An error occurred:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

// GET /api/profile 使用Token获取用户信息
app.get("/api/profile", authenticateToken, async (req, res) => {
    res.send(req.user);
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001')
})