module.exports = (ctx, next) => {
  const req = ctx.request
  const body = req.body
  const file = req.files.file
  // console.log('body', body)
  // console.log('file', file)
  return new Promise(resolve => {
    setTimeout(() => {
      ctx.body = { hello: 'world' }
      resolve(next())
    }, 2000)
  })
}
