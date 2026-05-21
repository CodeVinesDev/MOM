import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import meetingRoutes from "./routes/meetings";
import actionRoutes from "./routes/actions";
import emailRoutes from "./routes/email";
import { errorHandler } from "./middleware/errorHandler";
import { initScheduler } from "./services/scheduler";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use("/api/meetings", meetingRoutes);
app.use("/api/actions", actionRoutes);
app.use("/api/email", emailRoutes);
app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI!).then(() => {
  console.log("MongoDB connected");
  initScheduler(); // start cron jobs
  app.listen(process.env.PORT || 4000, () =>
    console.log(`Server running on :${process.env.PORT || 4000}`),
  );
});
