import { trpc } from '@src/router/trpc';
import { z } from 'zod';

export const testRouter = trpc.router({
  helloWorld: trpc.procedure
    .input(z.string())
    .query((opts) =>{
      return `you input is string:'${opts.input}'`
    }),
});
