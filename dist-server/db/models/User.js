"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = require("../database");
const prisma = (0, database_1.getDatabase)();
class UserModel {
    static async create(email, name) {
        return await prisma.user.create({
            data: {
                email,
                name
            }
        });
    }
    static async findById(id) {
        return await prisma.user.findUnique({
            where: { id }
        });
    }
    static async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }
    static async update(id, data) {
        return await prisma.user.update({
            where: { id },
            data
        });
    }
    static async delete(id) {
        return await prisma.user.delete({
            where: { id }
        });
    }
    static async findAll() {
        return await prisma.user.findMany();
    }
}
exports.UserModel = UserModel;
