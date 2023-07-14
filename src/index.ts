import Auth from "./auth";
import { GPTOpts } from './types.d';
import ChatGPT from './chat';

export default class ChatGPTWeb {
  accessToken: string;
  private chatbot: ChatGPT;
  constructor(readonly email: string, readonly password: string) {}
  async chat(input: string, options?: GPTOpts) {
    if (!this.chatbot) {
      if (!this.accessToken) {
        this.accessToken = await new Auth(this.email, this.password).getAccessToken();
      }
      this.chatbot = new ChatGPT(this.accessToken);
    }
    const response = this.chatbot.sendMessage(input, {
      onMessage: (message) => {
        options?.onMessage?.(message.text);
      },
    }).catch(e => ({
      text: `${e}`,
    }));
    return (await response).text;
  }
}
