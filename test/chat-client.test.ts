/**
 * ChatClient test
 */
import { ChatClient } from '../src/chat-client'
import { post, put } from '../src/request'

jest.mock('../src/request')
const mockPost = post as jest.Mock

describe('Chat Client Class', function () {
  let chatClient: ChatClient
  beforeEach(async () => {
    const tokenProvider: any = { getAuthToken: jest.fn().mockReturnValue('tokenProvider') }
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

  describe('get My groups', () => {
    it('should return correct groups', async () => {
      const users = [{ name: 'Bob' }]
      const resp = users
      mockPost.mockImplementation(() => Promise.resolve(resp))
      const myGroups = await chatClient.getMyGroups()
      expect(myGroups).toBe(users)
    })

    it('should call with token which is provided', async () => {
      const users = [{ name: 'Bob' }]
      const resp = users
      mockPost.mockImplementation(() => Promise.resolve(resp))
      const myGroups = await chatClient.getMyGroups()
      expect(mockPost).toHaveBeenCalledTimes(2)
      expect(mockPost).toHaveBeenLastCalledWith('https://my-chat-api/groups.list', {
        token: 'tokenProvider',
      })
    })
  })
})
