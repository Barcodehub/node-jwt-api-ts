"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserRole = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const roleResult = yield database_1.default.query('SELECT id FROM roles WHERE name = $1', ['user']);
        if (roleResult.rows.length === 0) {
            return res.status(500).json({ message: "Default user role not found" });
        }
        const userRoleId = roleResult.rows[0].id;
        const { rows } = yield database_1.default.query('INSERT INTO users (username, password, role_id) VALUES ($1, $2, $3) RETURNING id', [username, hashedPassword, userRoleId]);
        res.status(201).json({
            message: "User registered successfully",
            userId: rows[0].id,
            role: 'user'
        });
    }
    catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ message: "Username already exists" });
        }
        res.status(500).json({ message: "Error registering new user" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const { rows } = yield database_1.default.query('SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username = $1', [username]);
        if (rows.length === 0)
            return res.status(404).json({ message: "User not found" });
        const user = rows[0];
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(401).json({ message: "Invalid password" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role_name }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '24h' });
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
});
exports.login = login;
const changeUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, newRole } = req.body;
    try {
        const roleResult = yield database_1.default.query('SELECT id FROM roles WHERE name = $1', [newRole]);
        if (roleResult.rows.length === 0)
            return res.status(400).json({ message: "Invalid role" });
        const roleId = roleResult.rows[0].id;
        const { rowCount } = yield database_1.default.query('UPDATE users SET role_id = $1 WHERE id = $2', [roleId, userId]);
        if (rowCount === 0)
            return res.status(404).json({ message: "User not found" });
        res.json({ message: "User role updated successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error changing user role" });
    }
});
exports.changeUserRole = changeUserRole;
