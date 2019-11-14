const Koa = require('koa')
const app = new Koa()

// 跨域
const cors = require('@koa/cors')
app.use(cors())

// 路由
require('./router/index')(app)

// 端口
app.listen(3000)
console.log('http://127.0.0.1:3000')
