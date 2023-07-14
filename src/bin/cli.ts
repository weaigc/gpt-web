#!/usr/bin/env node

import { Command } from 'commander';
import Debug from 'debug';
import { getConfig } from '../config';
import ChatGPTWeb from '../';
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
        lastLength = msg.trim().length;
      },
    });
    spinner.write(response.slice(lastLength));
    lastLength = 0;
    spinner.write('\n');
    spinner.stop();
  }
}

async function checkConfig(opts = {}, type: 'server' | 'cli') {
  const { email, password } = opts as any;
  const config = await getConfig({
    email,
    password,
  });

  if(!config.email || !config.password) {
    throw new Error(`首次启动需要配置 OpenAI 账号密码，启动命令为 gpt-web ${type} -e 邮箱 -p 密码`);
  }

  return {
    email: config.email,
    password: config.password,
  }
}

const program = new Command();
program
  .name('gpt-web')
  .description('一个基于 ChatGPT Web 版本的聊天机器人')
  .version(pkg.version);


program.command('server')
  .description('启动一个 OpenAI 格式的接口服务器')
  .option('-P, --port', '服务端口号, 默认为 8000')
  .option('-e, --email <value>', 'OpenAI 邮箱，仅第一次需要')
  .option('-p, --password <value>', 'OpenAI 密码，仅第一次需要')
  .action(async (opts) => {
    debug('server mode');
    const { email, password } = await checkConfig(opts, 'server');
    serve(email, password, opts.port);
  });

program.command('cli')
  .description('终端聊天机器人')
  .option('-e, --email <value>', 'OpenAI 邮箱，仅第一次需要')
  .option('-p, --password <value>', 'OpenAI 密码，仅第一次需要')
  .action(async (opts) => {
    debug('cli mode');
    const { email, password } = await checkConfig(opts, 'cli');
    cli(email, password);
  });

program.parse();

