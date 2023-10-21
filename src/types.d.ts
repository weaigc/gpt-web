export type Role = 'user' | 'assistant' | 'system'
export type Action = 'next' | 'variant';
export type Model = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-32k';

export type SendMessageBrowserOptions = {
  timeout?: number
  action?: Action
  model?: Model
  onMessage?: (partialResponse: ChatMessage) => void
  abortSignal?: AbortSignal
}

export interface ChatMessage {
  id: string
  text: string
  role: Role
  name?: string
  delta?: string
  detail?:
    | openai.CreateChatCompletionResponse
    | CreateChatCompletionStreamResponse

  // relevant for both ChatGPTAPI and ChatGPTUnofficialProxyAPI
  parentMessageId?: string

  // only relevant for ChatGPTUnofficialProxyAPI (optional for ChatGPTAPI)
  conversationId?: string
}

/**
 * https://chat.openapi.com/backend-api/conversation
 */
export type ConversationJSONBody = {
  /**
   * The action to take
   */
  action: string

  /**
   * The ID of the conversation
   */
  conversation_id?: string

  /**
   * Prompts to provide
   */
  messages: Prompt[]

  /**
   * The model to use
   */
  model: Model

  /**
   * The parent message ID
   */
  parent_message_id: string
}

export type ConversationResponseEvent = {
  message?: Message
  conversation_id?: string
  error?: string | null
}

export type GPTMessage = (msg: string) => void

export interface GPTOpts {
  model?: Model
  action?: Action
  onMessage?: GPTMessage
}

export interface APIMessage {
  role: Role
  content: string
}

export interface APIRequest {
  stream?: string
  model: Model
  action: Action
  messages: APIMessage[]
}

export interface APIResponse {
  whisper?: string
  choices: {
    message: APIMessage
  }[]
}

