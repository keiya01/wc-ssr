import fastify, { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import fastifyStatic from 'fastify-static';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { resolve } from 'path';
import UniversalRouter from 'universal-router';
import { routes } from '../universal/routes';
import { html } from './html';
import { getScriptFileName } from './resource';

type App = FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>;

const route = (app: App) => {
  const router = new UniversalRouter(routes);
  app.get('*', async (req, reply) => {
    const template = await router.resolve(req.url);
    reply.header('Content-Type', 'text/html; charset=utf-8');
    reply.send(html(template, { scripts: [getScriptFileName('/main')] }));
  });
}

const start = async () => {
  const app = fastify({ logger: true });
  app.register(
    fastifyStatic,
    {
      root: resolve('dist', 'client'),
      prefix: '/dist/client/'
    }
  );
  app.register(
    fastifyStatic,
    {
      root: resolve('public'),
      prefix: '/public/',
      decorateReply: false,
    }
  );

  route(app);

  try {
    await app.listen(3000);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
