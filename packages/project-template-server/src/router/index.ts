import { trpc } from '@src/router/trpc';
import { testRouter } from './test';

export const appRouter = trpc.router({
  test: testRouter,
});
