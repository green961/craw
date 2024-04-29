import path from 'path'
import puppeteer from 'puppeteer'
;(async () => {
  const browser = await puppeteer.launch({ headless: false })

  let arr = generateUrls()

  let n = 2
  for (let i = 0; i < arr.length; i += n) {
    const tt = arr.slice(i, i + n)
    await executeTasks(tt)
  }

  async function executeTasks(tt: [string, string][]) {
    await Promise.all(
      tt.map(async ([url, filename]) => {
        let rand = Math.floor(Math.random() * 2000)

        const page = await browser.newPage()
        await page.goto(url)
        await page.setViewport({ width: 1920, height: 1080 })

        await new Promise((r) => setTimeout(r, 1000 + rand))
        await page.waitForNetworkIdle()
        const p = path.resolve('douban', filename)
        await page.screenshot({
          path: p,
          fullPage: true,
        })

        await page.close()
      })
    )
  }

  await browser.close()
})()

const startUrl = 'https://movie.douban.com/top250'
const filePrefix = '豆瓣top250之'
function generateUrls() {
  const arr: [string, string][] = []

  for (let i = 0; i < 250; ) {
    const url = i === 0 ? startUrl : `${startUrl}?start=${i}&filter=`
    const filename = `${filePrefix}${`${i + 1}-${(i += 25)}`}.png`
    arr.push([url, filename])
  }
  return arr
}
