import { config } from "dotenv";
import Logging from "../middleware/logging";
import mongoose from "mongoose";

config();
const mongoUri = process.env.MONGO_URI!;

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const mongooseConnection = async (attempt = 1): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 20,
      family: 4,
    });
    Logging.info("📦 Database connected");
    return conn;
  } catch (err) {
    Logging.error(
      `Unable to connect to the database (attempt ${attempt}/${MAX_RETRIES}): ${err}`,
    );
    if (attempt >= MAX_RETRIES) throw err;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return mongooseConnection(attempt + 1);
  }
};

mongoose.connection.on("disconnected", () => {
  Logging.warn("📦 Database disconnected — driver will attempt to reconnect");
});

mongoose.connection.on("reconnected", () => {
  Logging.info("📦 Database reconnected");
});

mongoose.connection.on("error", (err) => {
  Logging.error("Database connection error: " + err);
});

export default mongooseConnection;
