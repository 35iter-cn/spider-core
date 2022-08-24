import { Page } from "puppeteer"
import { Cluster } from "puppeteer-cluster"
import { TaskFunction } from "puppeteer-cluster/dist/Cluster"
import { runCheck } from "./check"

let cluster: Promise<Cluster> | null = null

export async function launch() {
  return cluster
    ? cluster
    : (cluster = Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 3,
        timeout: 2147483647, // 32-bits max number
      }))
}

export async function destory() {
  if (!cluster) return
  const _cluster = await cluster
  await _cluster.idle()
  await _cluster.close()
  cluster = null
}

export async function openURL({
  url,
  task,
  check,
  checkTimeout = 10 * 1000,
  device = "pc",
}: {
  url: string
  task: TaskFunction<any, any>
  /**
   * 页面是否加载完成的检查，对于前后端分离的页面有奇效
   */
  check?: (page: Page) => Promise<boolean>

  /**
   * check 超时时间
   */
  checkTimeout?: number

  /**
   * 设备宽度
   */

  device?: "pc" | "mobile" | number
}): Promise<any | null> {
  const _cluster = await launch()

  const timetag = `open ${url} take:`
  const time = +new Date()
  try {
    return await _cluster.execute({}, async (params) => {
      const { page } = params
      // ua
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"
      )

      // 默认pc 大小
      await page.setViewport({
        width: device === "pc" ? 1400 : device === "mobile" ? 375 : device,
        height: 1000,
      })

      await page.setDefaultTimeout(0)
      // 完全打开页面后
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        /**
         * 对于单页应用，有可能会在一个page里面长时间做任务，所以不能给超时时间（默认一个页面生命周期30秒）
         */
        timeout: 0,
      })

      // 额外的判断，

      if (check) {
        await runCheck(() => check(page), checkTimeout)
      }

      console.log(timetag, +new Date() - time)

      return await task(params)
    })
  } catch (error) {
    console.log(error)

    return null
  }
}
