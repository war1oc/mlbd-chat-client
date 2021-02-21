/**
 * ChatClient test
 */
import { ChatClient } from '../src/chat-client'

describe('Chat Client Class', function () {
  it('should create a new Chat client', function () {
    const tokenProvider: any = {}
    const pusherProvider: any = {}

    const chatClient = new ChatClient({
      chatApiEndpoint: 'https://my-chat-api',
      tokenProvider: tokenProvider,
      pusherProvider: pusherProvider,
    })

    expect(chatClient).toBeDefined()
  })
})
