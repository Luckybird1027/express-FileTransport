import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const configFilePath = path.join(dirname, 'config', 'config.json');

export class Config {
    secret: string | null = null;
    port: string | null = null;
    mongodb_username: string | null = null;
    mongodb_password: string | null = null;
    mongodb_database: string | null = null;
    constructor(configObj: {
        secret?: string | null,
        port?: string | null,
        mongodb_username?: string | null,
        mongodb_password?: string | null,
        mongodb_database?: string | null
    }) {
        this.secret = configObj.secret ?? null;
        this.port = configObj.port ?? null;
        this.mongodb_username = configObj.mongodb_username ?? null;
        this.mongodb_password = configObj.mongodb_password ?? null;
        this.mongodb_database = configObj.mongodb_database ?? null;
    }
}

export function LoadConfig(): Config {
    try {
        const data = fs.readFileSync(configFilePath, 'utf8');
        const parsedConfig = JSON.parse(data);
        return new Config(parsedConfig);
    } catch (err) {
        console.error("Error while reading configuration file:", err);
        return new Config({})
    }
}
