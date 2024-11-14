import officials from "Officials";
import { Hono } from "hono";
import { logger } from "hono/logger";
const app = new Hono().basePath('/api');

app.use(logger())

app.route('/officials', officials);

app.notFound((c) => {
  return c.text("Custom 404 Message", 404);
});

export default app;