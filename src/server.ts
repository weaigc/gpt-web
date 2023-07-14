import express from 'express';
import assert from 'assert';
import ChatGPTWeb from '.';
import type { APIRequest, APIResponse } from './types.d';

const app = express();
app.use(express.json());

function parseOpenAIMessage(request: APIRequest) {
  return {
    prompt: request.messages?.reverse().find((message) => message.role === 'user')?.content,
    model: request.model,
  };
}

function responseOpenAIMessage(content: string, input?: string): APIResponse {
  return {
    whisper: input,
    choices: [{
      message: {
        role: 'assistant',
        content,
      },
    }],
  };
}

export default function serve(email: string, password: string, port = 8000) {
  const chatbot = new ChatGPTWeb(email, password);

  app.post(['/', '/api/conversation'], async (req, res) => {
    const { prompt, model } = parseOpenAIMessage(req.body);
    assert(prompt, 'input text can\'t be empty');
    const content = await chatbot.chat(prompt, { model });
    const response = responseOpenAIMessage(content);
    res.json(response);
  });

  app.get(['/', '/api/conversation'], async (req, res) => {
    const { text, model } = req.query || {};
    if (!text) {
      return res.status(500).write('text参数不能为空');
    }
    res.set('Cache-Control', 'no-cache');
    res.set('Content-Type', 'text/event-stream;charset=utf-8');
    let lastLength = 0;
    const content = await chatbot.chat(text, {
      model,
      onMessage: (msg) => {
        res.write(msg.slice(lastLength));
        lastLength = msg.length;
      }
    });
    res.end(content.slice(lastLength));
  });

  app.listen(port, '0.0.0.0');
  console.log(`\n服务启动成功，测试链接: http://localhost:${port}/api/conversation?text=hello\n`);
}
/**
curl http://127.0.0.1:8000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{
     "model": "gpt-3.5-turbo",
     "messages": [{"role": "user", "content": "hello"}],
   }'
 */