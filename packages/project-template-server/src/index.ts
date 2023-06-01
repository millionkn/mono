import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from "./router"
import fastify from 'fastify';

export type AppRouter = typeof appRouter

const server = fastify({
  maxParamLength: 5000,
});
server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter },
});
await server.listen({ port: 3000 });