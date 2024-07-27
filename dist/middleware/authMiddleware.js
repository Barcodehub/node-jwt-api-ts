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
exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token)
        return res.status(403).json({ message: "No token provided" });
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
        if (err)
            return res.status(401).json({ message: "Unauthorized" });
        const decodedToken = decoded;
        req.userId = decodedToken.id;
        req.userRole = decodedToken.role;
        next();
    });
};
exports.verifyToken = verifyToken;
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield database_1.default.query('SELECT r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [req.userId]);
        if (rows.length === 0 || rows[0].name !== 'admin') {
            return res.status(403).json({ message: "Require Admin Role!" });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ message: "Error checking user role" });
    }
});
exports.isAdmin = isAdmin;
