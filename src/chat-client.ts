import { post } from './request'
import { TokenProvider } from './token-provider'
import { PusherProvider } from './pusher'

export interface IAttachmentOptions {
  title: string
  mime_type: string
  url: string
}

export interface ISendMessageOptions {
  groupId: string
  message?: string
  attachments?: IAttachmentOptions[]
  parentMessageId?: string
  mentions?: string[]
}

export interface IMarkGroupAsReadOptions {
  groupId: string
}

export interface ISearchMessagesOptions {
  keyword: string
  groupId?: string
  limit?: number
  offset?: number
}

export class ChatClient {
  private options: ChatClientOptions
  private tokenProvider: TokenProvider
  private pusherProvider: PusherProvider

  constructor(options: ChatClientOptions) {
    this.options = options
    this.tokenProvider = options.tokenProvider

    this.pusherProvider = new PusherProvider({
      ...options.pusherOptions,
      authEndpoint: `${this.options.chatApiEndpoint}/channel.auth`,
      tokenProvider: this.tokenProvider
    })
  }

  public async getMyGroups() {
    const token = await this.tokenProvider.getAuthToken()
    return post(`${this.options.chatApiEndpoint}/groups.list`, { token })
  }

  public async sendMessage(sendMessageOptions: ISendMessageOptions) {
    const token = await this.tokenProvider.getAuthToken()
    const { groupId, message, attachments, parentMessageId, mentions } = sendMessageOptions

    if (!message && (!attachments || !attachments.length)) {
      throw new Error('Either message or attachments is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.send`, {
      token,
      group_id: groupId,
      message,
      attachments,
      parent_message_id: parentMessageId,
      mentions
    })
  }

  public async getGroupMessages(groupId: string, limit?: number, skipTillTime?: Date) {
    const token = await this.tokenProvider.getAuthToken()
    let uri = `${this.options.chatApiEndpoint}/messages.list?`

    if (limit) {
      uri += `limit=${limit}`
    }

    if (skipTillTime) {
      uri += `${limit ? '&' : ''}skip_till_time=${skipTillTime}`
    }

    return post(uri, { token, group_id: groupId })
  }

  public async getMyStats() {
    const token = await this.tokenProvider.getAuthToken()
    return post(`${this.options.chatApiEndpoint}/users.stats`, { token })
  }

  public async markGroupAsRead(markGroupAsReadOptions: IMarkGroupAsReadOptions) {
    const token = await this.tokenProvider.getAuthToken()
    const { groupId } = markGroupAsReadOptions

    if (!groupId) {
      throw new Error('groupId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.read`, {
      token,
      group_id: groupId
    })
  }

  public async deleteMessage(messageId: string) {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.delete`, {
      token,
      message_id: messageId
    })
  }

  public async getGroup(groupId: string) {
    const token = await this.tokenProvider.getAuthToken()

    if (!groupId) {
      throw new Error('groupId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/groups.get`, {
      token,
      group_id: groupId
    })
  }

  public async getMessage(messageId: string) {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.get`, {
      token,
      message_id: messageId
    })
  }

  public async searchMessages(options: ISearchMessagesOptions) {
    const token = await this.tokenProvider.getAuthToken()

    let uri = `${this.options.chatApiEndpoint}/messages.search?`

    const { limit, offset, keyword, groupId } = options

    if (limit) {
      uri += `limit=${limit}`
    }

    if (offset) {
      uri += `${limit ? '&' : ''}offset=${offset}`
    }

    if (!keyword) {
      throw new Error('keyword is required.')
    }

    const body: any = { token, keyword }

    if (groupId) {
      body.group_id = groupId
    }

    return post(uri, body)
  }

  public async getGroupAttachments(groupId: string, limit?: number, offset?: number) {
    const token = await this.tokenProvider.getAuthToken()

    let uri = `${this.options.chatApiEndpoint}/attachments.list?`

    if (limit) {
      uri += `limit=${limit}`
    }

    if (offset) {
      uri += `${limit ? '&' : ''}offset=${offset}`
    }

    if (!groupId) {
      throw new Error('groupId is required.')
    }

    return post(uri, { token, group_id: groupId })
  }

  public async addPinnedMessage(messageId: string) {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.pinned.add`, {
      token,
      message_id: messageId
    })
  }

  public async removePinnedMessage(messageId: string) {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.pinned.remove`, {
      token,
      message_id: messageId
    })
  }

  public async getGroupPinnedMessages(groupId: string) {
    const token = await this.tokenProvider.getAuthToken()

    if (!groupId) {
      throw new Error('groupId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/groups.messages.pinned.list`, {
      token,
      group_id: groupId
    })
  }

  public async addSavedMessage(messageId: string) {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.saved.add`, {
      token,
      message_id: messageId
    })
  }

  public async removeSavedMessage(messageId: string) {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.saved.remove`, {
      token,
      message_id: messageId
    })
  }

  public async getSavedMessages() {
    const token = await this.tokenProvider.getAuthToken()

    return post(`${this.options.chatApiEndpoint}/messages.saved.list`, {
      token
    })
  }

  public async getGroupSavedMessages(groupId: string) {
    const token = await this.tokenProvider.getAuthToken()

    if (!groupId) {
      throw new Error('groupId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/groups.messages.saved.list`, {
      token,
      group_id: groupId
    })
  }

  public async connect() {
    const userId = await this.tokenProvider.getUserId()
    await this.pusherProvider.connect(userId)
  }

  public async disconnect() {
    this.pusherProvider.disconnect()
  }

  public onMessageRecieved(cb: (data: any) => void) {
    this.pusherProvider.bind('chat:message_received', cb)
  }

  public onAddedToGroup(cb: (data: any) => void) {
    this.pusherProvider.bind('chat:added_to_group', cb)
  }

  public onGroupUpdated(cb: (data: any) => void) {
    this.pusherProvider.bind('chat:group_updated', cb)
  }

  public onGroupDeleted(cb: (data: any) => void) {
    this.pusherProvider.bind('chat:group_deleted', cb)
  }

  public onGroupMemberAdded(cb: (data: any) => void) {
    this.pusherProvider.bind('chat:group_member_added', cb)
  }

  public onGroupMemberRemoved(cb: (data: any) => void) {
    this.pusherProvider.bind('chat:group_member_removed', cb)
  }

  public onMessageDeleted(cb: (data: any) => void) {
    this.pusherProvider.bind('chat:message_deleted', cb)
  }

  public onMessageRead(cb: (data: any) => void) {
    this.pusherProvider.bind('chat:message_read', cb)
  }

  public onMessageUpdated(cb: (data: any) => void) {
    this.pusherProvider.bind('chat:message_updated', cb)
  }
}

export interface PusherOptions {
  appKey: string
  cluster: string
  forceTLS: boolean
}

export interface ChatClientOptions {
  chatApiEndpoint: string
  tokenProvider: TokenProvider
  pusherOptions: PusherOptions
}
