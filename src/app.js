import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';

import routes from '~/core/rest';

import { NODE_ENV, SECRET_KEY, RATE_LIMIT } from './env';

const app = express();

/**
 * @name middlewares
 */
app.use(helmet());
app.use(cors());
app.use(rateLimit({ max: Number(RATE_LIMIT), windowMs: 15 * 60 * 1000 }));
app.use(compression());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @name REST
 */
app.use('/', routes);

export default app;
