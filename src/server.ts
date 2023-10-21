import express from 'express';
import assert from 'assert';
import cors from 'cors';
import Debug from 'debug'
import ChatGPTWeb from '.';
import type { APIRequest, APIResponse } from './types.d';

const debug = Debug('gpt-web:server')

const app = express();
app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
})

function parseOpenAIMessage(request: APIRequest) {
  return {
    stream: request.stream || 'gpt-3.5-turbo',
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

  app.get(['/', '/api/conversation'], async (req, res, next) => {
    const { text, model } = req.query || {};
    if (!text) {
      return res.status(500).write('text参数不能为空');
    }
    res.set('Content-Type', 'text/stream; charset=UTF-8');
    res.set('Transfer-Encoding', 'chunked');
    try {
      let lastLength = 0;
      const response = await chatbot.chat(text, {
        model,
        onMessage: (msg) => {
          if (msg.length > lastLength) {
            const chunk = msg.slice(lastLength)
            res.write(chunk);
            lastLength = msg.length;
          }
        }
      });
      debug('response', response)
      res.end();
    } catch (err) {
      next(err)
    }
  });

  app.post(/.*\/completions$/, async (req, res) => {
    const { prompt, model, stream } = parseOpenAIMessage(req.body);
    const isStream = stream || req.headers.accept?.includes('text/event-stream');
    if (isStream) {
      res.set('Content-Type', 'text/event-stream; charset=utf-8');
    }
    let lastLength = 0;
    assert(prompt, 'messages can\'t be empty!');
    const content = await chatbot.chat(prompt, {
      model,
      onMessage(msg) {
        if (isStream) {
          res.write(`data: ${JSON.stringify(responseOpenAIMessage(msg.slice(lastLength)))}\n\n`);
          lastLength = msg.length;
        }
      }
    }).catch(error => {
      console.log('Error:', error)
      return error;
    });
    if (isStream) {
      res.end(`data: [DONE]\n\n`);
    } else {
      const response = responseOpenAIMessage(content);
      res.json(response);
    }
  });

  app.get(/.*\/models$/, async (req, res) => {
    const models = await chatbot.getModels()
    return res.json(models)
  })

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