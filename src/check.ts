import { Page } from "puppeteer"

async function checkByElement(page: Page, selector: string) {
  return !!(await page.$(selector))
}

export async function runCheck(
  check: Function,
  timeout: number = 10 * 1000
): Promise<0 | 1> {
  let _resolve: any
  let _reject: any
  const maxTime = +new Date() + timeout

  // let _checkPromise = typeof check === 'function' ? check() : checkByElement(,check)

  ;(async function runrun() {
    const time = +new Date()
    let checkResult
    try {
      checkResult = await check()
    } catch (error) {
      _reject(new Error("检查失败，check 方法执行出错"))
    }

    if (time - maxTime > 0) {
      _reject(new Error("检查失败，超时"))

      return
    }

    if (checkResult) {
      // 成功了
      _resolve()
    } else {
      setTimeout(async () => {
        runrun()
      }, 100)
    }
  })()

  return new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })
}
