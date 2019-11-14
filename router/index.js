const Router = require('koa-router')
const router = new Router()
// koa-body
const path = require('path')
const koaBody = require('koa-body')

module.exports = (app) => {
  router.post(
    '/upload',
    koaBody({
      multipart: true,
      formidable: {
        keepExtensions: true, // 保持文件的后缀。
        uploadDir: path.join(__dirname, '../upload'), // 设置文件上传目录。
        maxFileSize: 2 * 1024 * 1024, // 设置上传文件大小最大限制，默认2M。
        onFileBegin: (name, file) => { // 文件上传前的设置。
          // console.log('name', name)
          // console.log('file', file)
          // file.path = file.path.replace('upload_', 'upload-new_')
        }
      }
    }),
    require('./upload')
  )
  // 异步需要Promise
  router.get('/query', (ctx, next) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        ctx.body = ctx.request.query
        resolve(next())
      }, 1000)
    })
  })
  app.use(router.routes()).use(router.allowedMethods())
}
