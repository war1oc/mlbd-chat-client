import { post } from './request'
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
    return post(`${this.options.chatApiEndpoint}/groups.list`, { token })
  }

  public async sendMessage(groupId: string, message: string) {
    const token = await this.tokenProvider.getAuthToken()
    return post(`${this.options.chatApiEndpoint}/messages.send`, {
      token,
      group_id: groupId,
      message
    })
  }

  public async getGroupMessages(groupId: string, limit?: number, skipTillTime?: Date) {
    const token = await this.tokenProvider.getAuthToken()
    let uri = `${this.options.chatApiEndpoint}/messages.list?`

    if (limit) {
      uri += `limit=${limit}`
    }

    if (skipTillTime) {
      uri += `skip_till_time=${skipTillTime}`
    }

    return post(uri, { token, group_id: groupId })
  }

  public async getMyStats() {
    const token = await this.tokenProvider.getAuthToken()
    return post(`${this.options.chatApiEndpoint}/users.stats`, { token })
  }
}

export interface ChatClientOptions {
  chatApiEndpoint: string
  tokenProvider: TokenProvider
}
