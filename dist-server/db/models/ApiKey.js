"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyModel = void 0;
const database_1 = require("../database");
const prisma = (0, database_1.getDatabase)();
class ApiKeyModel {
    static async create(userId, key) {
        return await prisma.apiKey.create({
            data: {
                user_id: userId,
                key
            }
        });
    }
    static async findById(id) {
        return await prisma.apiKey.findUnique({
            where: { id }
        });
    }
    static async findByKey(key) {
        return await prisma.apiKey.findUnique({
            where: { key }
        });
    }
    static async findByUserId(userId) {
        return await prisma.apiKey.findMany({
            where: { user_id: userId }
        });
    }
    static async updateLastUsed(id) {
        return await prisma.apiKey.update({
            where: { id },
            data: {
                lastUsed: new Date()
            }
        });
    }
    static async delete(id) {
        return await prisma.apiKey.delete({
            where: { id }
        });
    }
    static async isValid(key) {
        const apiKey = await this.findByKey(key);
        return !!apiKey;
    }
}
exports.ApiKeyModel = ApiKeyModel;
