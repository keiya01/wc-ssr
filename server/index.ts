import fastify, { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import fastifyStatic from 'fastify-static';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { resolve } from 'path';
import { getServerSideProps } from '../pages/home';
import { html } from './html';
import { getScriptFileName } from './resource';

type App = FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>;

const route = (app: App) => {
  app.get('/home', async (req, reply) => {
    reply.header('Content-Type', 'text/html; charset=utf-8');
    const template = getServerSideProps();

    reply.send(html(template, { scripts: [getScriptFileName(req.url)] }));
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
