const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { FastifyAdapter } = require('@bull-board/fastify');
const fastify = require('fastify');
const { Queue } = require('bullmq');
const { createClient } = require('@redis/client');

const run = async () => {
  const {
    DASHBOARD_ROOT_PATH = '/',
    REDIS_HOST = 'redis',
    REDIS_PORT = 6379,
    REDIS_DB_NAME = '0',
    DELIMIER = '.',
  } = process.env;

  const redis = await createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    database: REDIS_DB_NAME,
  }).connect();

  console.log(`Connecting to Redis at ${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB_NAME}...`);

  // get queues
  const keys = await redis.keys(`bull:*`);

  const queueNamesSet = new Set(keys.map(key => key.replace(/^.+?:(.+?):.+?$/, '$1')));

  console.table(Array.from(queueNamesSet));

  const queues = Array.from(queueNamesSet).map((item) => new BullMQAdapter(new Queue(item, 
    { connection: { port: REDIS_PORT, host: REDIS_HOST, db: REDIS_DB_NAME} }), {delimiter: DELIMIER}));

  // create app
  const app = fastify({ logger: true });

  const serverAdapter = new FastifyAdapter();

  createBullBoard({
    queues,
    serverAdapter,
  });

  serverAdapter.setBasePath(DASHBOARD_ROOT_PATH);
  app.register(serverAdapter.registerPlugin(), { prefix: DASHBOARD_ROOT_PATH });
  await app.listen({ host: '0.0.0.0', port: 3000 });
  console.log(`Running on http://0.0.0.0:3000${DASHBOARD_ROOT_PATH}...`);
};

run().catch((e) => {
  console.error(e);``
  process.exit(1);
});