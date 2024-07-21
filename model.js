import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const MONGODB_USERNAME = 'Luckybird';
const MONGODB_PASSWORD = 'luckypassword';
const MONGODB_DATABASE = 'auth';

const MONGODB_URL = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@mongo:27017/${MONGODB_DATABASE}?authSource=admin`;
// const MONGODB_URL = 'mongodb://localhost:27017/auth'

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
        type: String, set(val) {
            return bcrypt.hashSync(val, 10)
        }
    }
})

export const User = mongoose.model('User', UserSchema)