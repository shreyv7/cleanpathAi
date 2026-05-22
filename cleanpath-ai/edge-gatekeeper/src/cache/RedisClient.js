"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_REDIS_CONFIG = void 0;
exports.createRedisClient = createRedisClient;
function createRedisClient(config) {
    const { IoRedisClient } = require('./IoRedisClient');
    return new IoRedisClient(config);
}
exports.DEFAULT_REDIS_CONFIG = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: 'cleanpath',
    connectTimeout: 5000,
    commandTimeout: 3000,
};
//# sourceMappingURL=RedisClient.js.map