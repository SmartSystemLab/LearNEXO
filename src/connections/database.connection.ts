import { config } from "dotenv";
import Logging from "../middleware/logging";
import mongoose from "mongoose";

config();
const mongoUri = process.env.MONGO_URI!;

const mongooseConnection = async () => {
  mongoose.connect(mongoUri)
    .then(() => Logging.info('MongoDB Connected'))
    .catch((err) => Logging.error('MongoDB Connection Error: ' + err));
}

export default mongooseConnection;