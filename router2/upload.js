// 官方文档-javascript：https://docs.azure.cn/zh-cn/storage/blobs/storage-quickstart-blobs-javascript-client-libraries-v10
// 官方文档-nodejs：https://docs.azure.cn/zh-cn/storage/blobs/storage-quickstart-blobs-nodejs-v10
// 工具：https://github.com/Azure/azure-storage-node
// 案例：https://github.com/Azure-Samples/storage-blobs-node-quickstart
// `.env`文件很重要，`.env`文件中的内容如下。
// AZURE_STORAGE_ACCOUNT_NAME=某某的账号
// AZURE_STORAGE_ACCOUNT_ACCESS_KEY=某某的秘钥
// 某某的账号：apcsocialsalesproddata
// 某某的秘钥：某某才知道
// 某某的容器：wechatgrab
// 上传路径：`https://${STORAGE_ACCOUNT_NAME}.blob.core.chinacloudapi.cn/${encodeURIComponent(containerName)}`
// 上传时怎么自定义名称呢？下述案例中的fromContainerURL方法内进行修改即可。
// 访问路径：`https://${STORAGE_ACCOUNT_NAME}.blob.core.chinacloudapi.cn/${encodeURIComponent(containerName)}/filename.png`
// 访问路径-案例：`https://apcsocialsalesproddata.blob.core.chinacloudapi.cn/wechatgrab/upload_230d5cfd4265e1aef7d843c0e963cc2d.png`
// 浏览器直接访问居然是下载？是的！因为响应的`Content-Type`是`application/octet-stream`。但是依然可给`img`和`background`使用。
// 客户端直传的话，可以使用类似七牛的方式。服务端生成token返回给客户端，官方称我所谓的token为共享访问签名(SAS)。然后客户端使用相应的jssdk配合token进行上传。
// 共享访问签名(SAS)是一组数据，以查询字符串的形式带在`url`后即可。数据格式为：`?se=aa&sp=bb&sv=cc&ss=xx&srt=yy&sig=zz`。
// 如果你不担心安全问题，可以把token的过期时间设置为100年(强烈不建议)。那么客户端可直接写死token并直接使用。

require('dotenv').config() // 让项目可以使用`process.env.`获取`.env`文件中的内容。
const fs = require('fs')
const path = require('path')
const {
  Aborter,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  SharedKeyCredential,
  StorageURL,
  uploadStreamToBlockBlob,
  uploadFileToBlockBlob
} = require('@azure/storage-blob')

async function uploadStream (aborter, containerURL, filePath) {
  filePath = path.resolve(filePath)
  const fileName = path.basename(filePath).replace('.md', '-stream.md')
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName)
  const stream = fs.createReadStream(filePath, { highWaterMark: FOUR_MEGABYTES })
  const uploadOptions = { bufferSize: FOUR_MEGABYTES, maxBuffers: 5 }
  return await uploadStreamToBlockBlob(aborter, stream, blockBlobURL, uploadOptions.bufferSize, uploadOptions.maxBuffers)
}

async function uploadLocalFile (aborter, containerURL, filePath) {
  filePath = path.resolve(filePath)
  const fileName = path.basename(filePath)
  myFilename = fileName
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName)
  return await uploadFileToBlockBlob(aborter, filePath, blockBlobURL)
}

async function showContainerNames (aborter, serviceURL) {
  let response
  let marker
  do {
    response = await serviceURL.listContainersSegment(aborter, marker)
    marker = response.marker
    for (let container of response.containerItems) {
      console.log(` - ${container.name}`)
    }
  } while (marker)
}

async function showBlobNames (aborter, containerURL) {
  let response
  let marker
  do {
    response = await containerURL.listBlobFlatSegment(aborter)
    marker = response.marker
    for (let blob of response.segment.blobItems) {
      console.log(` - ${blob.name}`)
    }
  } while (marker)
}

const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY
const ONE_MEGABYTE = 1024 * 1024
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE
const ONE_MINUTE = 60 * 1000
const containerName = 'wechatgrab'
let myFilename = ''

module.exports = async (ctx, next) => {
  const req = ctx.request
  const body = req.body // multipart/form-data 类型的普通数据
  const file = req.files.file //  multipart/form-data 类型的文件数据(文件被上传到服务器之后的数据，其中包含文件在服务端的存储路径和文件大小等)

  const localFilePath = file.path
  const credentials = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY)
  const pipeline = StorageURL.newPipeline(credentials)
  const serviceURL = new ServiceURL(`https://${STORAGE_ACCOUNT_NAME}.blob.core.chinacloudapi.cn`, pipeline)
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName)
  const aborter = Aborter.timeout(30 * ONE_MINUTE)
  await showContainerNames(aborter, serviceURL) // 显示容器
  // await showBlobNames(aborter, containerURL) // 显示容器中的文件
  // await containerURL.create(aborter) // 创建容器
  // const uploadStreamToBlockBlob = await uploadStream(aborter, containerURL, localFilePath) // 上传本地文件到容器
  const uploadFileToBlockBlob = await uploadLocalFile(aborter, containerURL, localFilePath) // 上传本地文件到容器

  ctx.body = {
    hello: 'upload2',
    url: `https://${STORAGE_ACCOUNT_NAME}.blob.core.chinacloudapi.cn/${encodeURIComponent(containerName)}/${myFilename}`,
    uploadFileToBlockBlob
  }
}
