"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
// db/database.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getDatabase() {
    return prisma;
}
function closeDatabase() {
    return prisma.$disconnect();
}
