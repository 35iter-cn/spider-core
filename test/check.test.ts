import { describe, it } from "mocha"
import assert from "assert"

import { runCheck, sleep } from "../src/check"

describe("runCheck", function () {
  it("超时时间 1S,执行时间 2S,抛出异常", async function () {
    try {
      await runCheck(async () => {
        await sleep(2 * 1000)
        return true
      }, 1 * 1000)
    } catch (error) {
      assert.equal(error, "检查失败[超时]")
    }
  })

  it("执行过程中报错", async function () {
    try {
      await runCheck(async () => {
        throw new Error("出错啦")
      })
    } catch (error) {
      assert.equal(error, "检查失败[check方法执行出错]")
    }
  })

  it("超时时间 10S,执行时间 2S,检查完毕", async function () {
    const time = +new Date()
    const res = await runCheck(async () => {
      const delta = +new Date() - time

      if (delta > 2 * 1000) {
        return true
      } else {
        return false
      }
    })

    assert.equal(res, undefined)
  })

  it("默认超时时间 10S,执行时间 11S,抛出异常", async function () {
    try {
      await runCheck(async () => {
        await sleep(11 * 1000)
        return true
      })
    } catch (error) {
      assert.equal(error, "检查失败[超时]")
    }
  })
})
