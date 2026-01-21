import express from "express";
import { readDB, writeDB } from "../server.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { name, price, stock } = req.body;

  let db = readDB();
  const newProduct = {
    id: db.products.length + 1,
    name,
    price,
    stock
  };

  db.products.push(newProduct);
  writeDB(db);

  res.status(201).json({ message: "Product created", product: newProduct });
});

router.get("/", (req, res) => {
  let db = readDB();
  res.json(db.products);
});

export default router;
