/**
 * ChatClient test
 */
import { ChatClient } from '../src/chat-client'
import { post, put } from '../src/request'

jest.mock('../src/request')
const mockPost = post as jest.Mock

afterEach(() => {
  jest.resetAllMocks()
})

describe('Chat Client Class', function () {
  let chatClient: ChatClient

  beforeEach(async () => {
    const tokenProvider: any = { getAuthToken: jest.fn().mockReturnValue('<CHAT_TOKEN>') }
    const pusherProvider: any = {}

    chatClient = new ChatClient({
      chatApiEndpoint: 'https://my-chat-api',
      tokenProvider: tokenProvider,
      pusherProvider: pusherProvider,
    })
  })

  it('should be defined', () => {
    expect(chatClient).toBeDefined()
  })

  describe('getMyGroups', () => {
    it('should return correct groups', async () => {
      const received = [{ id: '1' }, { id: '2' }]
      mockPost.mockResolvedValue(received)
      const myGroups = await chatClient.getMyGroups()
      expect(myGroups).toBe(received)
    })

    it('should call post with token', async () => {
      const received = [{ id: '1' }, { id: '2' }]
      mockPost.mockResolvedValue(received)
      const myGroups = await chatClient.getMyGroups()
      expect(mockPost).toHaveBeenLastCalledWith('https://my-chat-api/groups.list', {
        token: '<CHAT_TOKEN>',
      })
    })

    it('should return error ', async () => {
      mockPost.mockImplementation(() => Promise.reject(new Error('error')))
      try {
        await chatClient.getMyGroups()
      } catch (e) {
        expect(e).toEqual(new Error('error'))
      }
    })
  })
})
