import { PrismaClient } from '@prisma/client'
import puppeteer from 'puppeteer'

const prisma = new PrismaClient({})

;(async () => {
  const chromePath = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`
  const browser = await puppeteer.launch({ headless: false, executablePath: chromePath, timeout: 0 })
  const page = await browser.newPage()
  await page.goto('https://www.instructables.com/projects/')
  await page.setViewport({ width: 1920, height: 1080 })
  await page.waitForNetworkIdle()

  const projects = await page.evaluate(() => {
    const ee = document.querySelectorAll('[class^=ibleCard__')

    const cards = [...ee].map((card) => {
      const title = card.querySelector('div>strong')!.textContent!

      const [favourites, views] = [...card.querySelectorAll('[class^=stats__] div')].map(
        (el) => el.textContent!
      )
      const url = card.querySelector('a')?.href!

      return { title, favourites, views, url }
    })

    return cards
  })

  // await prisma.content.createMany({
  //   data: projects,
  // })

  await new Promise((r) => setTimeout(r, 20000))
})()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
