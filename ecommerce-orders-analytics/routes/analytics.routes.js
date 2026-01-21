import express from "express";
import { readDB } from "../server.js";

const router = express.Router();

// 1. All Orders with Count
router.get("/allorders", (req, res) => {
  let db = readDB();

  let allOrders = [];
  db.orders.forEach(order => allOrders.push(order));

  res.json({
    count: allOrders.length,
    orders: allOrders
  });
});

// 2. Cancelled Orders
router.get("/cancelled-orders", (req, res) => {
  let db = readDB();

  const cancelled = db.orders.filter(o => o.status === "cancelled");

  res.json({
    count: cancelled.length,
    orders: cancelled
  });
});

// 3. Shipped Orders
router.get("/shipped", (req, res) => {
  let db = readDB();

  const shipped = db.orders.filter(o => o.status === "shipped");

  res.json({
    count: shipped.length,
    orders: shipped
  });
});

// 4. Total Revenue by Product
router.get("/total-revenue/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  let db = readDB();

  let product = db.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const revenue = db.orders
    .filter(o => o.productId === productId && o.status !== "cancelled")
    .reduce((sum, order) => sum + order.quantity * product.price, 0);

  res.json({ productId, revenue });
});

// 5. Overall Revenue
router.get("/alltotalrevenue", (req, res) => {
  let db = readDB();

  const revenue = db.orders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, order) => {
      const product = db.products.find(p => p.id === order.productId);
      return sum + order.quantity * product.price;
    }, 0);

  res.json({ totalRevenue: revenue });
});

export default router;
