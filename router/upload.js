const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')

module.exports = (ctx, next) => {
  const req = ctx.request
  const body = req.body // multipart/form-data 类型的普通数据
  let file = req.files.file //  multipart/form-data 类型的文件数据(文件被上传到服务器之后的数据，其中包含文件在服务端的存储路径和文件大小等)
  if (!file.length) file = [file]  // 单张图片上传兼容多张图片上传
  // 从本服务器把图片上传到另外一台服务器。
  return new Promise(async (resolve) => {
    const formData = new FormData()
    formData.append('a', '1')
    formData.append('b', '2')
    formData.append('c', '3')
    file.forEach(v => {
      const fileData = fs.createReadStream(v.path)
      formData.append('file', fileData)
    })
    await axios({
      method: 'post',
      url: 'http://127.0.0.1:3001/upload',
      headers: formData.getHeaders(), // 必不可少
      data: formData
    })
    ctx.body = { hello: 'upload' }
    resolve(next())
  })
}
