require("dotenv").config();

const fastify = require("fastify")({
  logger: true,
  ignoreTrailingSlash: true
});
const port = process.env.SERVER_PORT || 3000;

fastify
  .register(require("fastify-helmet"))
  .register(require('fastify-auth'))
  .register(require('./auth/jwt-auth'))
  .register(require("./routes/userRoutes"), { prefix: "/users" })
  .register(require("./routes/indexRoutes"))
  .register(require("./routes/candidateRoutes"));

fastify.listen(port, function(err) {
  if (err) throw err;
  console.log(`server listening on ${fastify.server.address().port}`);
});
