import { config } from "dotenv";
import { Sequelize } from "sequelize-typescript";
config();
const prodSSLValue = {
  require: true,
  rejectUnauthorized: false
}
const sslValue = process.env.NODE_ENV === 'PROD' ? prodSSLValue : false
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: "postgres",
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  models: [],
  dialectOptions: {
    ssl: sslValue
  },
  logging: false,
});

export default sequelize;
