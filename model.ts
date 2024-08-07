import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { Config, LoadConfig } from './config.js';

const config: Config = LoadConfig();

const MONGODB_USERNAME = process.env.MONGODB_USERNAME || (config.mongodb_username || null);
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || (config.mongodb_password || null);
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || (config.mongodb_database || "auth");
var MONGODB_URL: string | null = null;
// const MONGODB_URL = 'mongodb://localhost:27017/auth'

if (!MONGODB_USERNAME || !MONGODB_PASSWORD) {
    MONGODB_URL = 'mongodb://localhost:27017/auth'
}
else {
    MONGODB_URL = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@mongo:27017/${MONGODB_DATABASE}?authSource=admin`;
}

try {
    mongoose.connect(MONGODB_URL);
    // 测试连接成功
    mongoose.connection.on('connected', () => {
        console.log('Mongoose connection successful');
    });

    // 测试连接失败
    mongoose.connection.on('error', (error) => {
        console.error('Mongoose connection error: ', error);
        process.exit(1);
    });
} catch (error) {
    console.log('Mongoose connection error: ', error);
}

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: {
        type: String, set(val: string) {
            return bcrypt.hashSync(val, 10)
        }
    }
})

export const User = mongoose.model('User', UserSchema)