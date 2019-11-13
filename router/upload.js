const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')

module.exports = (ctx, next) => {
  const req = ctx.request
  const body = req.body // multipart/form-data 类型的普通数据
  const file = req.files.file //  multipart/form-data 类型的文件数据(文件被上传到服务器之后的数据，其中包含文件在服务端的存储路径和文件大小等)
  // 从本服务器把图片上传到另外一台服务器。
  return new Promise(async (resolve) => {
    const fileData = fs.createReadStream(file.path)
    const formData = new FormData()
    formData.append('a', '1')
    formData.append('b', '2')
    formData.append('c', '3')
    formData.append('file', fileData) // 多张图片要多个键值对，后端也是多个键值对接收，建议多次打接口。
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
