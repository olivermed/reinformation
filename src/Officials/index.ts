import { Hono } from "hono"

const officials = new Hono()

officials.get('/', (c) => c.text('List officials'))

export default officials;