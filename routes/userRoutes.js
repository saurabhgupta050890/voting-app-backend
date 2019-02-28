const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const db = require("../db/database").dbCleint;

module.exports = function(fastify, opts, next) {
  /**
   * REST API binding to create a new User.
   * @required name, email and password
   * Pass secret field to create an Admin user
   */

  fastify.post("/register", async (req, reply) => {
    const { email, name, password, secret } = req.body;

    //Validate Mandatory fields
    if (!(email && name && password)) {
      return reply
        .code(400)
        .send({ errorCode: 400, errorMessage: "Invalid data" });
    }

    //Check if Request is to create a admin user
    const isAdminCreateRequest =
      secret && secret === process.env.CREATE_ADMIN_SECRET;

    //Fetch User from email
    const user = db
      .get("users")
      .find({ email: email })
      .value();

    //Check if user email already exists
    if (user) {
      return reply
        .code(409)
        .send({ errorCode: 409, errorMessage: "Email already exists" });
    }

    // Create password hash for securely storing in database
    const pwdHash = await bcrypt.hash(password, await bcrypt.genSalt(10));

    //Create a new User Object
    const newUser = {
      name: req.body.name,
      email: req.body.email,
      password: pwdHash,
      role: isAdminCreateRequest ? "ROLE_ADMIN" : "ROLE_USER"
    };

    //Save User
    db.get("users")
      .push(newUser)
      .write();

    reply.send({ success: true, message: "User Created" });
  });

  /**
   * API for user login
   * @required email, password
   * @returns token
   */
  fastify.post("/login", async (req, reply) => {
    //Fetch User from Database
    const user = db
      .get("users")
      .find({ email: req.body.email })
      .value();

    //Invalid User email
    if (!user) {
      return reply
        .code(409)
        .send({ errorCode: 409, errorMessage: "Login failed" });
    }

    // Invalid password
    if (false === (await bcrypt.compare(req.body.password, user.password))) {
      return reply
        .code(409)
        .send({ errorCode: 409, errorMessage: "Login failed" });
    }

    const { email, role } = user;

    jwt.sign(
      { email, role },
      {
        key: fs.readFileSync("./config/jwt/private.pem"),
        passphrase: process.env.JWT_PASSPHRASE
      },
      { algorithm: "RS256" ,expiresIn: "2 days"},
      (error, token) => {
        if (error) throw error;

        reply.send({ token });
      }
    );
  });

  next();
};
