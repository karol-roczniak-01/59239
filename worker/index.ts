import { Ai, D1Database, VectorizeIndex } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import auth from './routes/auth';
import users from './routes/users';
import demand from './routes/demand';
import supply from './routes/supply';
import payment from './routes/payment';

export type Env = {
  DB: D1Database;
  AI: Ai;
  VECTORIZE: VectorizeIndex;
  JWT_SECRET_KEY: string;
  STRIPE_SECRET_KEY: string;
};

export type Variables = {
  user?: {
    userId: string;
    email: string;
    type: string;
  };
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>

app.route('/', auth);
app.route('/', users);
app.route('/', demand);
app.route('/', supply);
app.route('/', payment);

export default app;