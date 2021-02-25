/**
 * ChatClient test
 */
import { ChatClient, IMessageResponse } from '../src/chat-client'
import { post, put } from '../src/request'

jest.mock('../src/request')
const mockPost = post as jest.Mock

describe('Chat Client', function () {
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

    it('should return error if post call fails', async () => {
      mockPost.mockImplementation(() => Promise.reject(new Error()))

      try {
        await chatClient.getMyGroups()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should call post with correct parameter', async () => {
      const received = [{ id: '1' }, { id: '2' }]
      mockPost.mockResolvedValue(received)
      const myGroups = await chatClient.getMyGroups()
      expect(mockPost).toHaveBeenLastCalledWith('https://my-chat-api/groups.list', {
        token: '<CHAT_TOKEN>',
      })
    })
  })

  describe('sendMessage', () => {
    it('should call post with correct parameter', async () => {
      const inputMessage = {
        groupId: '1',
        message: 'Hello, world!',
      }
      const sendMessage = await chatClient.sendMessage(inputMessage)
      expect(mockPost).toHaveBeenLastCalledWith('https://my-chat-api/messages.send', {
        group_id: '1',
        message: 'Hello, world!',
        token: '<CHAT_TOKEN>',
      })
    })

    it('should return created message if post call success', async () => {
      const received = {
        attachments: [],
        group_id: '1',
        id: '1',
        message: 'Hello, world!',
      }
      mockPost.mockResolvedValue(received)

      const inputMessage = {
        groupId: '1',
        message: 'Hello, world!',
      }

      const sendMessage = await chatClient.sendMessage(inputMessage)
      expect(sendMessage.group_id).toBe(received.group_id)
      expect(sendMessage.message).toBe(received.message)
      expect(sendMessage).toEqual(received)
    })

    it('should return error if post call fails', async () => {
      mockPost.mockImplementation(() => Promise.reject(new Error()))
      const inputMessage = {
        groupId: '1',
        message: 'Hello, world!',
      }
      try {
        await chatClient.sendMessage(inputMessage)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should return error if validation failed', async () => {
      const inputMessage = {
        groupId: '1',
      }
      try {
        await chatClient.sendMessage(inputMessage)
      } catch (err) {
        expect(err).toBeDefined()
      }
    })
  })

  describe('getGroupMessages', () => {
    it('should call post with correct parameter', async () => {
      const getGroupMessages = await chatClient.getGroupMessages('1')
      expect(mockPost).toHaveBeenLastCalledWith('https://my-chat-api/messages.list?', {
        group_id: '1',
        token: '<CHAT_TOKEN>',
      })
    })

    it('should return messages if post call success', async () => {
      const received = [
        {
          attachments: [],
          group_id: '1',
          id: '1',
          message: 'Hello, world!',
        },
        {
          attachments: [],
          group_id: '2',
          id: '2',
          message: 'Hello, world again!',
        },
      ]
      mockPost.mockResolvedValue(received)
      const getGroupMessages = await chatClient.getGroupMessages('1')
      expect(getGroupMessages).toEqual(received)
    })

    it('should return error if post call fails', async () => {
      mockPost.mockImplementation(() => Promise.reject(new Error()))

      try {
        await chatClient.getGroupMessages('1')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })
})
