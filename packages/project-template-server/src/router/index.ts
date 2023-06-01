import { trpc } from './trpc';
 
export const appRouter = trpc.router({
  helloWorld: trpc.procedure.query(() => 'hello tRPC v10!'),
});

