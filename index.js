const Koa = require('koa')
const app = new Koa()

// 跨域
const cors = require('@koa/cors')
app.use(cors())

// koa-body
const path = require('path')
const koaBody = require('koa-body')
app.use(koaBody({
  multipart: true,
  formidable: {
    keepExtensions: true, // 保持文件的后缀。
    uploadDir: path.join(__dirname, 'upload'), // 设置文件上传目录。
    maxFieldsSize: 2 * 1024 * 1024, // 设置上传文件大小最大限制，默认2M。
    onFileBegin: (name, file) => { // 文件上传前的设置。
      // console.log('name', name)
      // console.log('file', file)
      // file.path = file.path.replace('upload_', 'upload-new_')
    }
  }
}))

// 路由
require('./router/index')(app)

// 端口
app.listen(3000)
console.log('http://127.0.0.1:3000')
