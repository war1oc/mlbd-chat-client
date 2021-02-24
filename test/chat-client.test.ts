/**
 * ChatClient test
 */
import { ChatClient } from '../src/chat-client'
import { post, put } from '../src/request'

jest.mock('../src/request')
const mockPost = post as jest.Mock

describe('Chat Client Class', function () {
  let chatClient: ChatClient

  beforeEach(() => {
    jest.resetAllMocks()
  })

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
    it('should return groups if post call is successful', async () => {
      const received = [{ id: '1' }, { id: '2' }]
      mockPost.mockResolvedValue(received)
      const myGroups = await chatClient.getMyGroups()
      expect(myGroups).toBe(received)
    })

    it('should return error if post call is fail ', async () => {
      mockPost.mockImplementation(() => Promise.reject(new Error()))

      try {
        await chatClient.getMyGroups()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should call post with token', async () => {
      const received = [{ id: '1' }, { id: '2' }]
      mockPost.mockResolvedValue(received)
      const myGroups = await chatClient.getMyGroups()
      expect(mockPost).toHaveBeenLastCalledWith('https://my-chat-api/groups.list', {
        token: '<CHAT_TOKEN>',
      })
    })
  })
})
