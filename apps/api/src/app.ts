import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { photosMetaRouter } from "./routes/photos.js";
import { photosProxyRouter } from "./routes/photosProxy.js";
import { downloadRouter } from "./routes/download.js";
import { favoritesRouter } from "./routes/favorites.js";
import { paymentRouter } from "./routes/payment.js";
import { contactRouter } from "./routes/contact.js";
import { webhookRouter } from "./routes/webhook.js";

const app = express();

app.use("/api/webhook/stripe", express.raw({ type: "application/json" }));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || process.env.NODE_ENV === "development") return cb(null, true);
    const allowed = (process.env.ORIGIN ?? "").split(",").map(s => s.trim()).filter(Boolean);
    allowed.push("http://localhost:4200");
    cb(null, allowed.includes(origin) || allowed.length === 0);
  },
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/photos", photosMetaRouter);
app.use("/api/photos", photosProxyRouter);
app.use("/api/download", downloadRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/contact", contactRouter);
app.use("/api/webhook/stripe", webhookRouter);

export default app;
