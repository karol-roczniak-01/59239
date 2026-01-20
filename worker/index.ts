import { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import auth from './routes/auth';
import users from './routes/users';

export type Env = {
  DB: D1Database;
  JWT_SECRET_KEY: string;
  STRIPE_SECRET_KEY: string;
};

export type Variables = {
  user?: {
    userId: number;
    email: string;
    type: string;
  };
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>

app.route('/', auth);
app.route('/', users)

export default app;