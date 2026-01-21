import express from "express";
import { readDB, writeDB } from "../server.js";

const router = express.Router();

// Create Order
router.post("/", (req, res) => {
  const { productId, quantity } = req.body;

  let db = readDB();
  let product = db.products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.stock === 0 || quantity > product.stock) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  const totalAmount = product.price * quantity;

  const newOrder = {
    id: db.orders.length + 1,
    productId,
    quantity,
    totalAmount,
    status: "placed",
    createdAt: new Date().toISOString().split("T")[0]
  };

  db.orders.push(newOrder);

  // Reduce stock
  product.stock -= quantity;

  writeDB(db);

  res.status(201).json({ message: "Order placed", order: newOrder });
});


// Get All Orders
router.get("/", (req, res) => {
  let db = readDB();
  res.json(db.orders);
});


// Cancel Order
router.delete("/:orderId", (req, res) => {
  const orderId = Number(req.params.orderId);
  let db = readDB();

  let order = db.orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status === "cancelled") {
    return res.status(400).json({ message: "Order already cancelled" });
  }

  const today = new Date().toISOString().split("T")[0];

  if (order.createdAt !== today) {
    return res.status(400).json({ message: "Cancellation allowed only for today's orders" });
  }

  // Revert stock
  let product = db.products.find(p => p.id === order.productId);
  if (product) {
    product.stock += order.quantity;
  }

  order.status = "cancelled";

  writeDB(db);

  res.json({ message: "Order cancelled", order });
});


// Change Order Status (placed → shipped → delivered)
router.patch("/change-status/:orderId", (req, res) => {
  const orderId = Number(req.params.orderId);
  const { status } = req.body;

  const validFlow = ["placed", "shipped", "delivered"];

  let db = readDB();
  let order = db.orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status === "cancelled" || order.status === "delivered") {
    return res.status(400).json({ message: "Cannot change status" });
  }

  const currentIndex = validFlow.indexOf(order.status);
  const newIndex = validFlow.indexOf(status);

  // Must follow correct flow
  if (newIndex !== currentIndex + 1) {
    return res.status(400).json({ message: "Invalid status flow" });
  }

  order.status = status;

  writeDB(db);

  res.json({ message: "Status updated", order });
});


export default router;
