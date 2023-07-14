<div align="center">

# GPT Web

> 一个基于逆向工程的 ChatGPT 命令行及 API 工具，支持账号登录 ChatGPT Web 版本，无需充值，无需代理即可使用。没有账号的话推荐使用 [gradio-chatbot](https://github.com/weaigc/gradio-chatbot)。

[![NPM](https://img.shields.io/npm/v/gpt-web.svg)](https://www.npmjs.com/package/gpt-web)
[![Apache 2.0 License](https://img.shields.io/github/license/saltstack/salt)](https://github.com/weaigc/gpt-web/blob/main/license)
</div>


- [快速上手](#快速上手)
- [安装](#安装)
- [使用](#使用)
  - [CLI 模式](#cli模式)
  - [API 模式](#api模式)
  - [函数调用](#函数调用)
- [鸣谢](#鸣谢)
- [License](#License)

## 安装
你需要使用 [Node.js 18](https://nodejs.org/) 及以上版本。

```bash
# 全局安装
npm install -g gpt-web
# 项目内安装
npm install gpt-web
```

## 使用

`gpt-web` 支持以下三种使用方式。

### CLI模式
```bash
gpt-web cli --email xxx@gmail.com --password xxx
```

> email 和 password 参数仅第一次启动需要。

### API模式
```bash
gpt-web server --email xxx@gmail.com --password xxx --port 8000

```
此命令会启动一个 WebServer，并支持流式和非流式输出。
 * 流式输出，直接访问 http://localhost:8000/api/conversation?text=hello 即可。
 * 非流式输出，调用方式同 ChatGPT API。以下为调用示例。

```
curl http://127.0.0.1:8000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{
     "model": "gpt-3.5-turbo",
     "messages": [{"role": "user", "content": "hello"}],
   }'
```
> model: 暂时只支持 `gpt-3.5-turbo`, `gpt-4` 和 `gpt-4-32k`。默认为 `gpt-3.5-turbo`，如需调 `GPT4` 相关的模型，需要你的账号已开通 GPT4 才行。

### 函数调用

```typescript
import ChatGPTWeb from 'gpt-web';

const bot = new ChatGPTWeb(email, password);

async function start() {
  const message = await bot.chat('hello', {
    onMessage(partialMsg) {
      console.log('stream output:', partialMsg);
    }
  });
  console.log('message', message);
}

start();
```

## 鸣谢
 - 感谢 [pandora](https://github.com/pengzhile/pandora) 提供的代理 API 及自动登录方法。

## License

Apache 2.0 © [LICENSE](https://github.com/weaigc/gpt-web/blob/main/LICENSE).
