import express from "express";
import fs from "fs";
import productsRouter from "./routes/products.routes.js";
import ordersRouter from "./routes/orders.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";

const app = express();
app.use(express.json());

// Functions to read/write db.json
export function readDB() {
  const data = fs.readFileSync("db.json");
  return JSON.parse(data);
}

export function writeDB(data) {
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));
}

// ROUTES
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/analytics", analyticsRouter);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
