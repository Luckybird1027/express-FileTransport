const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
try {
    mongoose.connect('mongodb://localhost:27017/auth');
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

const User = mongoose.model('User', UserSchema)

module.exports = { User }