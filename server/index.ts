import fastify, { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { getServerSideProps } from '../pages/home';
import { html } from './html';

/**
 * Webpackの代わりにviteを使ってみても良さそう
 */

type App = FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>;

const getScripts = (pathname: string) => {
  return `/dist/client${pathname}.bundle.js`
}

const route = (app: App) => {
  app.get('/dist/*', async (req, reply) => {
    reply.header('Content-Type', 'text/javascript; charset=utf-8');
    try {
      const content = await readFile(resolve(`.${req.raw.url!}`));
      reply.send(content);
    } catch {}
  });

  app.get('/home', async (req, reply) => {
    reply.header('Content-Type', 'text/html; charset=utf-8');
    const template = getServerSideProps({ user: { name: 'keiya01' }});

    reply.send(html(template, [getScripts(req.url)]));
  });
}

const start = async () => {
  const app = fastify({ logger: true });

  route(app);

  try {
    await app.listen(3000);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
