#!/usr/bin/env node

import * as readline from 'node:readline/promises';
import assert from 'node:assert';
import { promises as fsp } from 'node:fs';
import { stdin as input, stdout as output } from 'node:process';
import { Command } from 'commander';
import Debug from 'debug';
import ChatGPTWeb from '../';
import dotenv from 'dotenv';
import serve from '../server';
import { RL } from '../utils/rl';
import { Spinner } from '../utils/spinner';
const pkg = require('../../package.json');

const debug = Debug('gpt-web:cli');

export async function cli(email: string, password: string) {
  const bot = new ChatGPTWeb(email, password);

  let lastLength = 0;
  const spinner = new Spinner();
  while (true) {
    const prompt = await new RL().question('Man: ');
    if (!prompt.trim()) break;
    spinner.start();
    spinner.write('GPT: ');

    const response = await bot.chat(prompt, {
      onMessage: (msg: string) => {
        spinner.write(msg.slice(lastLength));
        lastLength = msg.length;
      },
    });
    spinner.write(response.slice(lastLength));
    lastLength = 0;
    spinner.write('\n');
    spinner.stop();
  }
}

dotenv.config();
const email = process.env.OPENAI_EMAIL;
const password = process.env.OPENAI_PASSWORD;

function checkConfig(opts: any, type: 'server' | 'cli') {
  if(!opts.email && !email) {
    throw new Error(`首次启动需要配置 OpenAI 账号密码，启动命令为 gpt-web ${type} -e 邮箱 -p 密码`);
  }
  debug('opts', opts);
  if (opts.email && opts.password) {
    fsp.writeFile('.env', `OPENAI_EMAIL=${opts.email}\nOPENAI_PASSWORD=${opts.password}`);
  }
}

const program = new Command();
program
  .name('gpt-web')
  .description('一个基于 ChatGPT Web 版本的聊天机器人')
  .version(pkg.version);


program.command('server')
  .description('启动一个 OpenAI 接口格式的服务器')
  .option('-P, --port', '服务端口号, 默认为 8000')
  .option('-e, --email <value>', 'OpenAI 邮箱，仅第一次需要')
  .option('-p, --password <value>', 'OPENAI 密码，仅第一次需要')
  .action((opts) => {
    debug('server mode');
    checkConfig(opts, 'server');
    serve(opts.email || email, opts.password || password, opts.port);
  });

program.command('cli')
  .description('终端聊天机器人')
  .option('-e, --email <value>', 'OpenAI 邮箱，仅第一次需要')
  .option('-p, --password <value>', 'OPENAI 密码，仅第一次需要')
  .parse()
  .action((opts) => {
    debug('cli mode');
    checkConfig(opts, 'cli');
    cli(opts.email || email, opts.password || password);
  });

program.parse();

