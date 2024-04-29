import fs from 'node:fs'
import path from 'node:path'
import { Page } from 'puppeteer'

export async function concurrencyControl(tasks: any[], n = 2) {
  let results = []
  for (let i = 0; i < tasks.length; i += n) {
    const tt = tasks.slice(i, i + n)
    results.push(...(await executeTasks(tt)))
  }

  return results
}

export async function executeTasks(tt: any[]) {
  const results = await Promise.all(tt.map((e) => e()))

  return results
}

function slp(n = 2000) {
  return function () {
    return new Promise((resolve, reject) => {
      return setTimeout(resolve, n, n)
    })
  }
}

export function randInt(n: number) {
  return Math.floor(Math.random() * n)
}

export async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      var totalHeight = 0
      var distance = 50 + Math.floor(Math.random() * 100)

      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance
        console.log({ totalHeight })
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 150)
    })
  })
}

export function mkRecursive(pathStr: string) {
  fs.mkdirSync(path.dirname(pathStr), { recursive: true })
  return pathStr
}
