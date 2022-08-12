# spider-core

使用 puppetter-cluster 的爬虫工具。

## 开发

启动编译环境：

```
# 安装依赖
yarn install
# 启动 tsc 环境
yarn dev
```

链接到 yarn 中：

```
yarn link

```

在测试项目中引入：

```
yarn link spider-core

```

## 安装

```
yarn install spider-core

```

使用方式：

```
import { openURL,destory } from 'spider-core'

await openURL({
  url: 'https://baidu.com',
  async task(page) {
    // do anything with page
  }
})

// 所有任务执行完成以后，关闭集群
destory()
```

## API

**openURL**

```
function openURL(params: {
  url: string;
  task: TaskFunction<any, any>;
  /**
    * 页面是否加载完成的检查，对于前后端分离的页面有奇效
    */
  check?: (page: Page) => Promise<boolean>;
  /**
    * check 超时时间
    */
  checkTimeout?: number;
}): Promise<any | null>;
```

**destory**

```
function destory(): Promise<void>;

```

## 特殊说明

### Timeout hit: 30000

puppetter-cluster 默认给每个 cluster 30 秒的使用时间，实际是不够用的，所以我将 timeout 设置为了最大值。在处理完所有任务以后，要记得手动关掉集群。
