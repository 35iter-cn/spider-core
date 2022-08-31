import { Page } from "puppeteer"

async function checkByElement(page: Page, selector: string) {
  return !!(await page.$(selector))
}

// 计时结束后的标志
const sleepStr = "awake"
export const sleep = (s: number) => {
  return new Promise<typeof sleepStr>((res) => {
    setTimeout(() => {
      res(sleepStr)
    }, s)
  })
}
/**
 *
 * @param check 检查方法，可以返回 promise 或者 boolean
 * @param timeout 检查超时时间，默认 10 秒钟，
 * @returns
 */

export async function runCheck(
  check: () => Promise<boolean> | boolean,
  timeout: number = 10 * 1000
): Promise<undefined> {
  let _resolve: any
  let _reject: any
  const maxTime = +new Date() + timeout

  const returnPromise = new Promise<undefined>((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })

  // let _checkPromise = typeof check === 'function' ? check() : checkByElement(,check)

  ;(async function runrun() {
    // 剩余时间
    const delta = maxTime - +new Date()

    if (delta < 0) {
      _reject("检查失败[超时]")
    }

    let checkResult: boolean | string = false

    try {
      // 每次执行 check，都与剩余时间进行比较，避免超时
      checkResult = await Promise.race([check(), sleep(delta)])
    } catch (error) {
      _reject("检查失败[check方法执行出错]")
    }

    if (checkResult === sleepStr) {
      // sleep 函数先结束，表示已经超时了
      _reject("检查失败[超时]")
    } else if (checkResult) {
      _resolve()
    } else if (!checkResult) {
      // check 执行返回 false，表示还没得到正确的结果，继续执行 check
      setTimeout(async () => {
        runrun()
      }, 100)
    }
  })()

  return returnPromise
}
