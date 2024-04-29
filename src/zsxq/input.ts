import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.on('line', async (command) => {
  switch (command) {
    case 'upload-next':
      await uploadNext()
      break
    case 'download-img':
      await downloadImg()
      break
    default:
      break
  }
})

async function uploadNext() {
  console.log('------')
}
async function downloadImg() {
  console.log('+++++++')
}
