import express, { Request, Response, NextFunction, Application } from 'express';
import { Server } from 'http';
import { config } from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import http from 'http';
import Logging from './middleware/logging';
import { errorResponse, notFound } from './middleware/errorHandler';
import { ResponseInterface } from './global/interface/response.interface';
import mongooseConnection from './connections/database.connection';
import authRoute from './auth/auth.router';
import path from 'path';

const app: Application = express();
const httpServer = http.createServer(app);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
config();

app.use((req, res, next) => {
  next();
});
app.use(express.static(path.join(__dirname, '../public')));

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(undefined, { swaggerOptions: { url: '/swagger.json' } }),
);

app.post(
  '/health-status',
  async (req: Request, res: Response<ResponseInterface>) => {
    res.status(200).send({
      message: '🚀 Learnexo server is up and running',
      status: true,
    });
  },
);
app.use('/api/v1/auth', authRoute);

app.use(notFound);
app.use(errorResponse);


const PORT: number = Number(process.env.PORT) || 3000;
(async () => {
  try {
    await mongooseConnection();
  } catch (error) {
    Logging.error('Unable to connect to the database:' + error);
  }
  const server: Server = httpServer.listen(PORT, () => {
    Logging.info(`🚀 App is running on port ${PORT}`);
  });
})();

