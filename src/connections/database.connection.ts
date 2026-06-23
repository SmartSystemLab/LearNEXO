import { config } from "dotenv";
import Logging from "../middleware/logging";
import mongoose from "mongoose";

config();
const mongoUri = process.env.MONGO_URI!;

const mongooseConnection = async () => {
  return mongoose
    .connect(mongoUri)
    .then(() => Logging.info("📦 Database connected"))
    .catch((err) => {
      Logging.error("Unable to connect to the database: " + err);
      throw err;
    });
}

export default mongooseConnection;