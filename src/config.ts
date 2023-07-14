import { promises as fsp } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const tokenPath = join(tmpdir(), 'gpt_web_token.json');

export const getConfig = async () => {
  try {
    if (await fsp.lstat(tokenPath)) {
      return JSON.parse(await fsp.readFile(tokenPath, 'utf-8'));
    }
  } catch (e) {
    return {};
  }
};

export const setConfig = async (config) => {
  const oldConfig = await getConfig();
  fsp.writeFile(tokenPath, JSON.stringify({
    ...oldConfig,
    ...config,
  }));
};
