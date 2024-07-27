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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const database_1 = __importDefault(require("../config/database"));
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield database_1.default.query('SELECT * FROM products');
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching products" });
    }
});
exports.getProducts = getProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const { rows } = yield database_1.default.query('SELECT * FROM products WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching product" });
    }
});
exports.getProduct = getProduct;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, description, price, quantity } = req.body;
    try {
        const { rows } = yield database_1.default.query('INSERT INTO products (code, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *', [code, description, price, quantity]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating product" });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { code, description, price, quantity } = req.body;
    try {
        const { rows } = yield database_1.default.query('UPDATE products SET code = $1, description = $2, price = $3, quantity = $4 WHERE id = $5 RETURNING *', [code, description, price, quantity, id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating product" });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const { rowCount } = yield database_1.default.query('DELETE FROM products WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting product" });
    }
});
exports.deleteProduct = deleteProduct;
