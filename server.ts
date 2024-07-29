import express, { NextFunction, Request, Response } from 'express';
import { User } from './model.js';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import { Config, LoadConfig } from './config.js';

const config: Config = LoadConfig();

const SECRET: string = process.env.SECRET ?? (config.secret ?? "DefauleSecret");
const PORT: number = parseInt(process.env.PORT ?? (config.port ?? "3001"))

const app = express()
app.use(express.json())

// GET 路由 测试服务器是否正常运行
app.get("/", (req: Request, res: Response) => {
    res.send("OK!");
    console.log("OK!");
})

// GET /api/users路由 返回所有用户
app.get("/api/users", async (req: Request, res: Response) => {
    const users = await User.find();
    res.send(users);
    console.log(users);
})

// POST /api/register路由 注册用户
app.post("/api/register", async (req: Request, res: Response) => {
    try {
        const user = await User.create({
            username: req.body.username,
            password: req.body.password,
        });
        res.status(201).send(user); // 201是Created状态码，表示资源已被创建
    } catch (error: any) {
        if (error.name === 'MongooseError' && error.code === 11000) {
            // 11000是MongoDB的重复键错误代码
            res.status(400).send({ error: 'Username already exists' }); // 400是Bad Request状态码
        } else {
            console.error('An error occurred:', error);
            res.status(500).send({ error: 'Internal Server Error' }); // 500是Internal Server Error状态码
        }
    }
});

app.post("/api/login", async (req: Request, res: Response) => {
    try {
        const username = req.body.username;
        if (username === undefined || username === null) {
            return res.status(400).send({ error: 'Missing username' });
        }
        const user = await User.findOne({ username: username });
        if (!user) {
            console.log(username + " not found!");
            return res.status(422).send({ error: 'Invalid username or password' }); // 422是Unprocessable Entity状态码
        }
        const password = req.body.password;
        if (password === undefined || password === null) {
            return res.status(400).send({ error: 'Missing password' });
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password!);
        if (!isPasswordValid) {
            console.log(username + " password Invalid!");
            return res.status(422).send({ error: 'Invalid username or password' }); // 422是Unprocessable Entity状态码
        }
        console.log(username + " Login success!");
        // 登录成功，返回user，生成token并返回
        const token = jwt.sign({
            id: String(user._id)
        }, SECRET);
        res.send({
            user: user,
            token: token
        });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send({ error: 'Internal Server Error' }); // 500是Internal Server Error状态码
    }
});

interface AuthRequest extends Request {
    user?: any;
}

// authenticateToken中间件 将Token验证到req.user
const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        const decoded: JwtPayload = jwt.verify(rawToken, SECRET) as JwtPayload;
        const { id } = decoded;
        const user = await User.findById(id);

        if (!user) {
            console.log("User not found by Token");
            return res.status(404).send({ error: 'User not found' });
        }

        console.log(user.username + " found by Token");
        req.user = user;
        next();

    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            console.log("Invalid token");
            return res.status(401).send({ error: 'Invalid token' });
        }

        console.error('An error occurred:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

// GET /api/profile路由 使用Token获取用户信息
app.get("/api/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
    res.send(req.user);
});

// 确保目标目录static文件夹存在
const uploadDir = './static/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created ./static/ directory');
}

// 配置 multer
const upload = multer({ dest: uploadDir }).any();

// POST /api/upload路由 文件上传
app.post("/api/upload", authenticateToken, upload, async (req: AuthRequest, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send({ error: 'No file uploaded' });
        }
        let fileOriginalName = file.originalname;
        let filename = "static/" + fileOriginalName;

        await fs.promises.rename(file.path, filename);

        const username = req.user.username;
        console.log("File " + fileOriginalName + " upload successfully by " + username);
        res.status(201).send({
            filename: fileOriginalName,
            username
        });
    } catch (error: any) {
        console.error("File upload failed:", error);
        return res.status(500).send({ error: 'Internal Server Error', message: error.message });
    }
});

// GET /api/download路由 文件下载
app.get("/api/download", async (req: Request, res: Response) => {
    let filename = req.query.filename as string | undefined;
    if (filename === undefined) {
        return res.status(400).send({ error: 'Filename is required' });
    }
    filename = decodeURI(filename);

    try {
        await fs.promises.access('./static/' + filename, fs.constants.F_OK | fs.constants.R_OK);

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename=${encodeURI(filename)}`,
        });
        const readStream = fs.createReadStream('./static/' + filename);
        readStream.pipe(res);
        console.log("File " + filename + " start download");
        readStream.on('end', () => {
            console.log("File " + filename + " complete download");
        });
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.log("File " + filename + " not found");
            return res.status(404).send({ error: 'File not found' });
        }
        console.error("File download failed:", error);
        return res.status(500).send({ error: 'Internal Server Error', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT)
})