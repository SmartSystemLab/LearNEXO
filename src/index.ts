import express, { Request, Response, NextFunction, Application } from 'express';
import { Server } from 'http';
import { config } from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import Logging from 'middleware/logging';
import { errorResponse, notFound } from 'middleware/errorHandler';
import { ResponseInterface } from 'global/interface/response.interface';
import sequelize from 'sequelize/connection';

const app: Application = express();
const httpServer = http.createServer(app);
app.use(cors());
config();

app.use((req, res, next) => {
  next();
});

app.post(
  '/health-status',
  async (req: Request, res: Response<ResponseInterface>) => {
    res.status(200).send({
      message: '🚀 Web socket server is up and running',
      status: true,
    });
  },
);

app.use(notFound);
app.use(errorResponse);

const PORT: number = Number(process.env.PORT) || 3000;
sequelize
  .sync
  // {alter: true}
  ()
  .then(() => {
    Logging.info('Database connected successfully');
    const server: Server = httpServer.listen(PORT, () => {
      Logging.info(`🚀 App is running on port ${PORT}`);
    });
  })
  .catch((error: any) => {
    Logging.error('Unable to connect to the database:' + error);
  });

