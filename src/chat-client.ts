import { post, put } from './request'
import { TokenProvider } from './token-provider'
import { PusherProvider } from './pusher'

export interface IAttachmentOptions {
  title: string
  mime_type: string
  url: string
  id?: string
  created_at?: string
  group_id?: string
  message_id?: string
  sender_id?: string
}

export interface IAttachmentUploadUrl {
  upload_link: string
  key: string
}

export interface IAttachmentFileDetail {
  file_name: string
  file_size: string
  view_link: string
}

export interface ISendMessageOptions {
  groupId: string
  message?: string
  attachments?: IAttachmentOptions[]
  parentMessageId?: string
  mentions?: string[]
  files?: File[]
}

export interface IMessageHistoryOptions {
  groupId: string
  limit?: number
  inclusive?: boolean
  latest?: string
  oldest?: string
}

export interface IMarkGroupAsReadOptions {
  groupId: string
}
export interface ISuccessResponse {
  message: string
}

export interface ISearchMessagesOptions {
  keyword: string
  groupId?: string
  limit?: number
  offset?: number
}

export interface IRecipients {
  has_read: boolean
  user_id: string
}

export interface IParentMessage {
  id: string
  sender_id: string
  message?: string
  attachments?: IAttachmentOptions[]
}

export interface ILastMessage {
  group_id: string
  id: string
  message: string
  parent_message?: IParentMessage
  parent_message_id: string
  reply_count: number
  recipients: IRecipients[]
  sender_id: string
  sent_at: string
}

export interface IMessageResponse {
  attachments: IAttachmentOptions[]
  group_id: string
  id: string
  mentions: Array<string>
  message: string
  parent_message?: IParentMessage
  parent_message_id: string
  recipients: IRecipients[]
  reply_count: number
  sender_id: string
  sent_at: string
  updated_at: string
}

export interface IGroup {
  created_at: string
  id: string
  last_message_at: string
  members: Array<string>
  meta: null | any
  status: number
  last_message?: ILastMessage
}

export interface IGroupStats {
  group_id: string
  unread_mention_count: number
  unread_message_count: number
}

export interface IMyStats {
  group_stats: IGroupStats[]
  unread_mention_count: number
  unread_message_count: number
}

export interface IChatGroupUpdated {
  created_at: string
  id: string
  last_message_at: string
  members: Array<string>
  meta: null | any
  status: number
  last_message: ILastMessage
}

export interface IChatGroupDeleted {
  id: string
  deleted_at: string
}

export interface IChatGroupMembers {
  group_id: string
  user_ids: Array<string>
}

export interface IChatGroupMember {
  group_id: string
  user_ids: Array<string>
}

export interface IChatMessageDeleted {
  deleted_at: string
  group_id: string
  id: string
}

export class ChatClient {
  private options: ChatClientOptions
  private tokenProvider: TokenProvider
  private pusherProvider: PusherProvider

  constructor(options: ChatClientOptions) {
    this.options = options
    this.tokenProvider = options.tokenProvider
    this.pusherProvider = options.pusherProvider

    // this.pusherProvider = new PusherProvider({
    //   ...options.pusherOptions,
    //   authEndpoint: `${this.options.chatApiEndpoint}/channel.auth`,
    //   tokenProvider: this.tokenProvider,
    // })
  }

  public async getMyGroups(): Promise<IGroup[]> {
    const token = await this.tokenProvider.getAuthToken()
    return post(`${this.options.chatApiEndpoint}/groups.list`, { token })
  }

  public async sendMessage(sendMessageOptions: ISendMessageOptions): Promise<IMessageResponse> {
    const token = await this.tokenProvider.getAuthToken()
    let { groupId, message, attachments, parentMessageId, mentions, files } = sendMessageOptions

    if (files && files.length) {
      const attachmentFiles = files.map((f) => this.getFileWithProperType(f))

      const fileUploadPromises = attachmentFiles.map((f) => this.uploadAttachment(f))
      const keys = await Promise.all(fileUploadPromises)
      attachments = attachmentFiles.map((file, idx) => {
        return { title: file.name, url: keys[idx], mime_type: file.type }
      })
    }

    if (!message && (!attachments || !attachments.length)) {
      throw new Error('Either message or attachments is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.send`, {
      token,
      group_id: groupId,
      message,
      attachments,
      parent_message_id: parentMessageId,
      mentions,
    })
  }

  public async getGroupMessages(
    groupId: string,
    limit?: number,
    skipTillTime?: Date
  ): Promise<IMessageResponse[]> {
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

  public async getMessageHistory(options: IMessageHistoryOptions): Promise<IMessageResponse[]> {
    const token = await this.tokenProvider.getAuthToken()
    let uri = `${this.options.chatApiEndpoint}/messages.history?`

    let { limit, inclusive, latest, oldest, groupId } = options

    if (!latest && !oldest) {
      latest = new Date().toISOString()
      oldest = new Date(0).toISOString()
    }

    if (latest) {
      uri += `latest=${encodeURIComponent(latest)}`
    }
    if (oldest) {
      uri += `${latest ? '&' : ''}oldest=${encodeURIComponent(oldest)}`
    }

    if (limit) {
      uri += `&limit=${limit}`
    }

    if (inclusive) {
      uri += `&inclusive=${inclusive}`
    }

    return post(uri, { token, group_id: groupId, latest })
  }

  public async getMyStats(): Promise<IMyStats> {
    const token = await this.tokenProvider.getAuthToken()
    return post(`${this.options.chatApiEndpoint}/users.stats`, { token })
  }

  public async markGroupAsRead(
    markGroupAsReadOptions: IMarkGroupAsReadOptions
  ): Promise<ISuccessResponse> {
    const token = await this.tokenProvider.getAuthToken()
    const { groupId } = markGroupAsReadOptions

    if (!groupId) {
      throw new Error('groupId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.read`, {
      token,
      group_id: groupId,
    })
  }

  public async deleteMessage(messageId: string): Promise<ISuccessResponse> {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.delete`, {
      token,
      message_id: messageId,
    })
  }

  public async getGroup(groupId: string): Promise<IGroup> {
    const token = await this.tokenProvider.getAuthToken()

    if (!groupId) {
      throw new Error('groupId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/groups.get`, {
      token,
      group_id: groupId,
    })
  }

  public async getMessage(messageId: string): Promise<IMessageResponse> {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.get`, {
      token,
      message_id: messageId,
    })
  }

  public async searchMessages(options: ISearchMessagesOptions): Promise<IMessageResponse[]> {
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

  public async getGroupAttachments(
    groupId: string,
    limit?: number,
    offset?: number
  ): Promise<IAttachmentOptions[]> {
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

  public async addPinnedMessage(messageId: string): Promise<ISuccessResponse> {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.pinned.add`, {
      token,
      message_id: messageId,
    })
  }

  public async removePinnedMessage(messageId: string): Promise<ISuccessResponse> {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.pinned.remove`, {
      token,
      message_id: messageId,
    })
  }

  public async getGroupPinnedMessages(groupId: string): Promise<IMessageResponse[]> {
    const token = await this.tokenProvider.getAuthToken()

    if (!groupId) {
      throw new Error('groupId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/groups.messages.pinned.list`, {
      token,
      group_id: groupId,
    })
  }

  public async addSavedMessage(messageId: string): Promise<ISuccessResponse> {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.saved.add`, {
      token,
      message_id: messageId,
    })
  }

  public async removeSavedMessage(messageId: string): Promise<ISuccessResponse> {
    const token = await this.tokenProvider.getAuthToken()

    if (!messageId) {
      throw new Error('messageId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/messages.saved.remove`, {
      token,
      message_id: messageId,
    })
  }

  public async getSavedMessages(): Promise<IMessageResponse[]> {
    const token = await this.tokenProvider.getAuthToken()

    return post(`${this.options.chatApiEndpoint}/messages.saved.list`, {
      token,
    })
  }

  public async getGroupSavedMessages(groupId: string): Promise<IMessageResponse[]> {
    const token = await this.tokenProvider.getAuthToken()

    if (!groupId) {
      throw new Error('groupId is required.')
    }

    return post(`${this.options.chatApiEndpoint}/groups.messages.saved.list`, {
      token,
      group_id: groupId,
    })
  }

  public async getAttachmentFileDetail(attachmentId: string): Promise<IAttachmentFileDetail> {
    const token = await this.tokenProvider.getAuthToken()

    return post(`${this.options.chatApiEndpoint}/attachments.file.get`, {
      token,
      attachment_id: attachmentId,
    })
  }

  public async getAttachmentDownloadUrl(attachmentId: string): Promise<string> {
    const token = await this.tokenProvider.getAuthToken()

    const url = `${this.options.chatApiEndpoint}/attachments.file.download?token=${token}&attachment_id=${attachmentId}`
    return url
  }

  public async connect(): Promise<void> {
    const userId = await this.tokenProvider.getUserId()
    await this.pusherProvider.connect(userId)
  }

  public async disconnect(): Promise<void> {
    this.pusherProvider.disconnect()
  }

  public onMessageRecieved(cb: (data: IMessageResponse) => void) {
    this.pusherProvider.bind('chat:message_received', cb)
  }

  public onAddedToGroup(cb: (data: IGroup) => void) {
    this.pusherProvider.bind('chat:added_to_group', cb)
  }

  public onGroupUpdated(cb: (data: IChatGroupUpdated) => void) {
    this.pusherProvider.bind('chat:group_updated', cb)
  }

  public onGroupDeleted(cb: (data: IChatGroupDeleted) => void) {
    this.pusherProvider.bind('chat:group_deleted', cb)
  }

  public onGroupMemberAdded(cb: (data: IChatGroupMembers) => void) {
    this.pusherProvider.bind('chat:group_member_added', cb)
  }

  public onGroupMemberRemoved(cb: (data: IChatGroupMembers) => void) {
    this.pusherProvider.bind('chat:group_member_removed', cb)
  }

  public onMessageDeleted(cb: (data: IChatMessageDeleted) => void) {
    this.pusherProvider.bind('chat:message_deleted', cb)
  }

  public onMessageRead(cb: (data: IChatGroupMember) => void) {
    this.pusherProvider.bind('chat:message_read', cb)
  }

  public onMessageUpdated(cb: (data: IMessageResponse) => void) {
    this.pusherProvider.bind('chat:message_updated', cb)
  }

  public onPinnedMessageAdded(cb: (data: string) => void) {
    this.pusherProvider.bind('chat:pinned_message_added', cb)
  }

  public onPinnedMessageRemoved(cb: (data: string) => void) {
    this.pusherProvider.bind('chat:pinned_message_removed', cb)
  }

  public onSavedMessageAdded(cb: (data: string) => void) {
    this.pusherProvider.bind('chat:saved_message_added', cb)
  }

  public onSavedMessageRemoved(cb: (data: string) => void) {
    this.pusherProvider.bind('chat:saved_message_removed', cb)
  }

  private async uploadAttachment(file: File): Promise<string> {
    const { upload_link, key } = await this.getAttachmentUploadUrl(file.name, file.type)

    await put(upload_link, file, {
      'Content-Type': file.type,
    })

    return key
  }

  private getFileWithProperType(file: File): File {
    if (file.type) {
      return file
    }

    return new File([file], file.name, { type: 'application/octet-stream' })
  }

  private async getAttachmentUploadUrl(
    fileName: string,
    mimeType: string
  ): Promise<IAttachmentUploadUrl> {
    const token = await this.tokenProvider.getAuthToken()

    return post(`${this.options.chatApiEndpoint}/attachments.upload.url`, {
      token,
      file_name: fileName,
      mime_type: mimeType,
    })
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
  pusherProvider: PusherProvider
}
