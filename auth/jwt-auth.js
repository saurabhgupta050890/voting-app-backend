const jwt = require("jsonwebtoken");
const fastifyPlugin = require("fastify-plugin");
const fs = require("fs");
const db = require("../db/database").dbCleint;

// Authentication Plugin
const jwtAuth = function(fastify, opts, next) {
  fastify.decorate("jwtAuth", function(request, reply, done) {
    // IF no Authorization header is present return Unauthorized
    if (!request.req.headers["authorization"]) {
      return reply.code(401).send({ message: " Unauthorized" });
    }

    // Verify JWT token
    jwt.verify(
      request.req.headers["authorization"].replace("Bearer", "").trim(),
      fs.readFileSync("./config/jwt/public.pem"),
      (err, decoded) => {
        if (err || !decoded.email) {
          return reply.code(401).send({ message: "Unauthorized" });
        }

        const user = db
          .get("users")
          .find({ email: decoded.email })
          .value();

        // If user is not found
        if (!user) {
          return reply.code(401).send({ message: "Unauthorized" });
        }

        request.user = user;

        done();
      }
    );
  });

  next();
};

module.exports = fastifyPlugin(jwtAuth, ">=0.13.1");
