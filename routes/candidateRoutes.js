const db = require("../db/database").dbCleint;
const uuid = require("uuid/v1");

module.exports = function(fastify, ops, next) {
  /**
   * Get the list of Candidates
   */
  fastify.get(
    "/candidates",
    { beforeHandler: fastify.auth([fastify.jwtAuth]) },
    async (req, reply) => {
      const { user } = req;

      if (user.role === "ROLE_ADMIN") {
        // Logic for Candidates Total votes
        let candidates = db.get("candidates").value();
        candidates = candidates.map(candidate => {
          return Object.assign({}, candidate, {
            votes: db.get("candidateVoteCount").value()[candidate.id]
          });
        });

        reply.send(candidates);
      } else if (user.role === "ROLE_USER") {
        reply.send({
          candidates: db.get("candidates").value(),
          voted: db.get("userVotes").value()[user.email]
        });
        //Return list of Candidates and Selected vote
      }
    }
  );

  /**
   * Create a new candidate
   * @requires name
   * Needs Admin login
   */
  fastify.post(
    "/candidates",
    { beforeHandler: fastify.auth([fastify.jwtAuth]) },
    async (req, reply) => {
      const { user } = req;

      // Candidate name is required
      if (!req.body.candidateName) {
        return reply
          .code(400)
          .send({ errorCode: 400, errorMessage: "Candidate Name is Required" });
      }

      // Only Admin can create a candidate
      if (user.role !== "ROLE_ADMIN") {
        return reply.code(403).send({
          errorCode: 403,
          errorMessage: "User can't create a candidate"
        });
      }

      // New Candidate
      const candidate = {
        id: uuid(),
        name: req.body.candidateName
      };

      // Save a new Candidate
      db.get("candidates")
        .push(candidate)
        .write();

      //Set current vote count to 0
      db.get("candidateVoteCount")
        .assign({ [candidate.id]: 0 })
        .write();

      reply.send({
        success: true,
        message: "Candidate Created",
        id: candidate.id
      });
    }
  );

  /**
   * Register a vote for candidate
   */
  fastify.get(
    "/candidates/vote/:candidateId",
    { beforeHandler: fastify.auth([fastify.jwtAuth]) },
    async (req, reply) => {
      const { user } = req;
      const { candidateId } = req.params;

      // Get the candidate from id
      const candidate = db
        .get("candidates")
        .find({ id: candidateId })
        .value();

      // If Candidate not found
      if (!candidate) {
        return reply
          .code(409)
          .send({ errorCode: 409, errorMessage: "Candidate not found" });
      }

      // Only non Admin user can vote
      if (user.role !== "ROLE_USER") {
        return reply
          .code(409)
          .send({ errorCode: 409, errorMessage: "User can't vote" });
      }

      // Keep track of user Votes
      if (db.get("userVotes").value()[user.email]) {
        return reply
          .code(409)
          .send({ errorCode: 409, errorMessage: "User already voted" });
      }

      db.get("userVotes")
        .assign({ [user.email]: candidateId })
        .write();

      let count = db.get("candidateVoteCount").value()[candidateId] + 1;

      // Increase vote count for candidate
      db.get("candidateVoteCount")
        .assign({ [candidateId]: count })
        .write();

      reply.send({
        success: true,
        message: "Vote registered",
        id: candidateId
      });
    }
  );

  next();
};
