import assert from 'assert';
import fetch from './fetch';
import Debug from 'debug';
import { getConfig, setConfig } from './config';

const debug = Debug('gpt-web:auth');

const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.58';

export default class Auth {
  email: string;
  password: string;
  mfa: string;
  accessToken: string;
  expires: number;
  puid: string;
  cookie: string;
  constructor(
    email,
    password,
    mfa = '',
  ) {
    this.email = email;
    this.password = password;
    this.mfa = mfa;
  }

  private __check_email(email: string) {
    const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/
    return regex.test(email);
  }

  async getAccessToken(): Promise<string> {
    if (this.expires && this.expires > Date.now()) {
      debug('from instance', this.accessToken);
      return this.accessToken;
    }
    const json = await getConfig();
    if (json.expires > Date.now()) {
      this.expires = json.expires;
      this.accessToken = json.accessToken;
      debug('from cache', this.accessToken);
      return this.accessToken;
    }
    
    assert(this.__check_email(this.email) && this.password, 'invalid email or password.');
    return this.getToken();
  }

  private async getToken(): Promise<string> {
    const url = 'https://chatweb.deno.dev/oauth/token'
    const headers = {
      'Content-Type': 'application/json',
    };
    const data = {
      username: this.email,
      password: this.password,
    };
    const resp = await fetch(
      url, { headers, method: 'POST', body: JSON.stringify(data), redirect: 'manual' }
    );

    if (resp.status == 200) {
      const json = await resp.json() as any;
      if (!json.accessToken) {
        throw new Error('Get access token failed')
      }

      this.accessToken = json.accessToken
      this.puid = json.puid
      this.expires = json.expires ? new Date(json.expires).getTime() : Date.now() + 24 * 60 * 60 * 1000 // expire time hard code 1 day

      setConfig(
        {
          ...json,
          email: this.email,
          password: this.password,
          expires: this.expires,
        }
      )
      return this.accessToken;
    } else {
      throw new Error(resp.statusText)
    }
  }

  async getPuid(): Promise<string> {
    return this.puid
  }
}
