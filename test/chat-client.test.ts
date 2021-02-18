/**
 * ChatClient test
 */
import { ChatClient } from '../src/chat-client'
import { PusherProvider } from '../src/pusher'
import { TokenProvider } from '../src/token-provider'
import Pusher from 'pusher-js'

jest.mock('../src/pusher')
jest.mock('../src/token-provider')

jest.mock('pusher-js', () => {
  const Pusher = require('pusher-js-mock').PusherMock
  return Pusher
})

describe('Chat Client Class', () => {
  it('should create a new Chat client', () => {
    const chatClient = new ChatClient({
      chatApiEndpoint: 'https://my-chat-api',
      tokenProvider: new TokenProvider({
        url: 'https://my-api/auth/chat',
      }),

      pusherProvider: new PusherProvider({
        appKey: 'appKey-string',
        cluster: 'cluster-string',
        forceTLS: true,
        authEndpoint: 'https://my-chat-api',
        tokenProvider: new TokenProvider({
          url: 'https://my-api/auth/chat',
        }),
        pusherOptions: new Pusher('appKey-string', {
          cluster: 'cluster-string',
          authEndpoint: 'https://my-chat-api/channel.auth',
          forceTLS: true,
        }),
      }),
    })

    console.log('ch', chatClient)
  })
})
