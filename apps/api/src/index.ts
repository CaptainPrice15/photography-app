import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: process.env.ORIGIN ?? "http://localhost:4200", credentials: true }));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes will be added in Phase 2
// import { authRouter } from "./routes/auth.js";
// import { photosRouter } from "./routes/photos.js";
// import { favoritesRouter } from "./routes/favorites.js";
// import { paymentRouter } from "./routes/payment.js";
// import { contactRouter } from "./routes/contact.js";
// import { downloadRouter } from "./routes/download.js";
// import { webhookRouter } from "./routes/webhook.js";

// app.use("/api/auth", authRouter);
// app.use("/api/photos", photosRouter);
// app.use("/api/favorites", favoritesRouter);
// app.use("/api/payment", paymentRouter);
// app.use("/api/contact", contactRouter);
// app.use("/api/download", downloadRouter);
// app.use("/api/webhook/stripe", webhookRouter);

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
