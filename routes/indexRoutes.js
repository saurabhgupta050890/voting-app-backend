module.exports = function (fastify, opts, next) {
  fastify.get('/', async (request, reply) => {
    reply.type('application/json').code(200)

    return { hello: 'hello world' }
  })


  fastify.get('/auth', async (request, reply) => {
    reply.type('application/json').code(200)

    return { hello: 'hello ' + request.email }
  })
  next()
}