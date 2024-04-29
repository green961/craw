import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs/promises'
import puppeteer from 'puppeteer'
const prisma = new PrismaClient({})

;(async () => {
  const browser = await puppeteer.launch({ headless: false })
  let arr = generateUrls()
  arr = arr.slice(0, 1)

  const n = 4
  const pages = await Promise.all(
    Array.from({ length: n }).map(async (e) => {
      const page = await browser.newPage()

      await page.setViewport({ width: 1920, height: 1080 })
      return page
    })
  )

  const promises = [] // 存储所有的异步操作的 Promise
  for (const meta of arr) {
    const page = pages[0]
    let [url, filename] = meta
    await page.goto(url)
    await new Promise((r) => setTimeout(r, 1000))
    await page.waitForNetworkIdle()
    const movies_url = await page.$$eval('.hd a', (a) => a.map((e) => e.href))

    const cObj = await getDetails(movies_url)
    const eObj = cObj.map((e) => {
      const obj = {}
      for (const prop in e) {
        if (maps.has(prop)) {
          obj[maps.get(prop)] = e[prop]
        }
      }
      return obj
    })

    await prisma.movie.createMany({
      data: eObj as any,
    })
    promises.push(fs.writeFile(`data/${filename}`, JSON.stringify(cObj, null, 4)))
  }

  await Promise.all(promises) // 等待所有异步操作完成
  console.log('done')
  await new Promise((r) => setTimeout(r, 20000))

  async function getDetails(arr: string[]) {
    arr = arr.slice(0, 10)
    let cc = []
    for (let i = 0; i < arr.length; i += n) {
      const tt = arr.slice(i, i + n)
      cc.push(...(await executeTasks(tt)))
    }
    return cc
  }

  async function executeTasks(tt: string[]) {
    return await Promise.all(
      tt.map(async (url: string, i: number) => {
        const page = pages[i]
        await page.goto(url)
        await new Promise((r) => setTimeout(r, 1000 + Math.floor(Math.random() * 2000)))
        await page.waitForNetworkIdle()

        const shit = await page.$eval('#content', (e) => {
          const officialWebsiteRE = /(.*?):\s*(.+)/
          const irsc = e.querySelector('#interest_sectl .rating_self.clearfix')
          const movie = {
            电影名称: e.querySelector('h1 span').textContent,
            评分: +irsc.querySelector('strong').textContent,
            评分人数: +irsc.querySelector('.rating_sum span').textContent,
          }

          e.querySelector('#info')
            .textContent.split('\n')
            .map((e) => e.trim())
            .filter(Boolean)
            .forEach((e) => {
              const ee = e
                .split(':')
                .map((e) => e.trim())
                .filter(Boolean)
              if (ee.length === 2) {
                movie[ee[0]] = ee[1]
              } else if (officialWebsiteRE.test(e)) {
                let [_, key, value] = e.match(officialWebsiteRE)
                movie[key] = value
              }
            })

          return movie
        })

        return shit
      })
    )
  }
})()

const maps = new Map()
;[
  ['电影名称', 'name'],
  ['评分', 'rating'],
  ['评分人数', 'number_of_ratings'],
  ['导演', 'director'],
  ['编剧', 'writer'],
  ['主演', 'starring'],
  ['类型', 'genre'],
  ['官方网站', 'officialWebsite'],
  ['制片国家/地区', 'country'],
  ['语言', 'language'],
  ['上映日期', 'releaseDate'],
  ['片长', 'runtime'],
  ['又名', 'aliasName'],
  ['IMDb', 'IMDB'],
].forEach(([a, b]) => maps.set(a, b))

const startUrl = 'https://movie.douban.com/top250'
const filePrefix = '豆瓣top250之'
function generateUrls() {
  const arr = []

  for (let i = 0; i < 250; ) {
    const url = i === 0 ? startUrl : `${startUrl}?start=${i}&filter=`
    const filename = `${filePrefix}${`${i + 1}-${(i += 25)}`}.json`
    arr.push([url, filename])
  }
  return arr
}
