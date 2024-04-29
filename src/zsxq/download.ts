import fs from 'fs'
import https from 'https'
import sizeOf from 'image-size'
import path from 'path'

const url =
  'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/66399947ea6b45289c8d77b6d4568cc5~tplv-k3u1fbpfcp-watermark.image'

const imgPath = path.join('.', '.img')
if (fs.existsSync(imgPath)) {
  fs.rmSync(imgPath, {
    recursive: true,
  })
}
fs.mkdirSync(imgPath)

let links = [url]
for (let i = 0; i < links.length; i++) {
  const filePath = path.join(imgPath, i + 1 + '.image')
  let currentTotal = 0

  await aa(i, filePath, currentTotal)
  console.log('end')
}

async function aa(i: number, filePath: string, currentTotal: number) {
  return new Promise<void>(async (resolve) => {
    await downloadFile(links[i], filePath, async (totalBytes, chunkBytes) => {
      currentTotal += chunkBytes

      if (currentTotal >= totalBytes) {
        await bb(filePath, resolve)
      }
    })
    // resolve()
  })
}

function bb(filePath: string, r) {
  // return new Promise<void>((resolve) => {
  setTimeout(() => {
    const { type } = sizeOf(fs.readFileSync(filePath))
    fs.renameSync(filePath, filePath + '.' + type)
    console.log(`${filePath} 下载完成，重命名为 ${filePath + '.' + type}`)
    r()
  }, 1000)
  // })
}

function downloadFile(url, destinationPath, progressCallback?) {
  let resolve, reject
  const promise = new Promise((x, y) => {
    resolve = x
    reject = y
  })

  const request = https.get(url, (response) => {
    if (response.statusCode !== 200) {
      const error = new Error(`failed: code ${response.statusCode}. URL: ${url}`)
      response.resume()

      reject(error)
      return
    }

    const file = fs.createWriteStream(destinationPath)
    file.on('finish', () => resolve())
    file.on('error', (error) => reject(error))
    response.pipe(file)

    if (progressCallback) {
      const totalBytes = parseInt(response.headers['content-length'], 10)
      response.on('data', onData.bind(null, totalBytes))
    }
  })
  request.on('error', (error) => reject(error))

  return promise

  function onData(totalBytes, chunk) {
    progressCallback(totalBytes, chunk.length)
  }
}
