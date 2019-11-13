const Router = require('koa-router')
const router = new Router()

module.exports = (app) => {
  router.post('/upload', require('./upload'))

  app
    .use(router.routes())
    .use(router.allowedMethods())
}
