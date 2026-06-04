import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import healthRoute from "./routes/health.route.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ message: "ShipLoop AI is running" });
});

app.use("/api/health", healthRoute);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
