module.exports = (ctx, next) => {
  const req = ctx.request
  const body = req.body // multipart/form-data 类型的普通数据
  const file = req.files.file //  multipart/form-data 类型的文件数据(文件被上传到服务器之后的数据，其中包含文件在服务端的存储路径和文件大小等)
  return new Promise(resolve => {
    setTimeout(() => {
      ctx.body = { hello: 'upload2' }
      resolve(next())
    }, 2000)
  })
}
