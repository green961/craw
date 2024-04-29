import puppeteer from 'puppeteer'
import os from 'os'
import path from 'path'

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: {
    width: 0,
    height: 0,
  },
  userDataDir: path.join(os.homedir(), '.puppeteer-data'),
})

const page = await browser.newPage()

await page.goto('https://wx.zsxq.com/dweb2/article?groupId=51122858222824')

const links = await page.evaluate(() => {
  let links = []

  const lines = document.querySelectorAll('.ql-editor p')
  for (let i = 0; i < lines.length; i++) {
    const matchRes = lines[i].textContent.trim().match(/!\[[^\[\]\(\)]*\]\(([^\[\]\(\)]*)\)/)

    if (matchRes) {
      links.push({
        index: i,
        link: matchRes?.[1],
      })
    }
  }
  return links
})
