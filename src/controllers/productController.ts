import { Request, Response } from 'express';
import pool from '../config/database';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { code, description, price, quantity } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO products (code, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [code, description, price, quantity]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error creating product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, description, price, quantity } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE products SET code = $1, description = $2, price = $3, quantity = $4 WHERE id = $5 RETURNING *',
      [code, description, price, quantity, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
};