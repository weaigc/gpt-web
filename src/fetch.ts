import { fetch, setGlobalDispatcher, ProxyAgent } from 'undici';

const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY;
if (httpProxy) {
  setGlobalDispatcher(new ProxyAgent(httpProxy));
}

export default fetch;
