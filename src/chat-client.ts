import request from 'request-promise-native'

import { TokenProvider } from './token-provider'

export class ChatClient {
  private options: ChatClientOptions
  private tokenProvider: TokenProvider

  constructor(options: ChatClientOptions) {
    this.options = options
    this.tokenProvider = options.tokenProvider
  }

  public async getMyGroups() {
    const token = await this.tokenProvider.getAuthToken()

    const result = await request({
      method: 'POST',
      uri: `${this.options.chatApiEndpoint}/groups.list`,
      body: { token }
    })

    return result
  }

  public async sendMessage(groupId: string, message: string) {
    const token = await this.tokenProvider.getAuthToken()

    const result = await request({
      method: 'POST',
      uri: `${this.options.chatApiEndpoint}/messages.send`,
      body: { token, group_id: groupId, message }
    })

    return result
  }

  public async getGroupMessages(groupId: string, limit: number, skipTillTime: Date) {
    const token = await this.tokenProvider.getAuthToken()
    let uri = `${this.options.chatApiEndpoint}/messages.list?`

    if (limit) {
      uri += `limit=${limit}`
    }

    if (skipTillTime) {
      uri += `skip_till_time=${skipTillTime}`
    }

    const result = await request({
      method: 'POST',
      uri: uri,
      body: { token, group_id: groupId }
    })

    return result
  }
}

export interface ChatClientOptions {
  chatApiEndpoint: string
  tokenProvider: TokenProvider
}
