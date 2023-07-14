import Chat from '../src';

import dotenv from 'dotenv';
dotenv.config();

(async function start() {
    const email = process.env.OPENAI_EMAIL;
    const password = process.env.OPENAI_PASSWORD;
    const openai = new Chat(email!, password!);
    const response = await openai.chat('hello');
    console.log(response);    
})();
