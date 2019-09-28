import xhr from 'xhr'

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

    return new Promise((resolve, reject) => {
      xhr(
        {
          method: 'POST',
          uri: `${this.options.chatApiEndpoint}/groups.list`,
          json: true,
          body: { token: token }
        },
        (err, resp, body) => {
          if (err) {
            return reject(err)
          }

          return resolve(body)
        }
      )
    })
  }

  public async sendMessage(groupId: string, message: string) {
    const token = await this.tokenProvider.getAuthToken()

    return new Promise((resolve, reject) => {
      xhr(
        {
          method: 'POST',
          uri: `${this.options.chatApiEndpoint}/messages.send`,
          json: true,
          body: { token, group_id: groupId, message }
        },
        (err, resp, body) => {
          if (err) {
            return reject(err)
          }

          return resolve(body)
        }
      )
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

    return new Promise((resolve, reject) => {
      xhr(
        {
          method: 'POST',
          uri: uri,
          json: true,
          body: { token, group_id: groupId }
        },
        (err, resp, body) => {
          if (err) {
            return reject(err)
          }

          return resolve(body)
        }
      )
    })
  }
}

export interface ChatClientOptions {
  chatApiEndpoint: string
  tokenProvider: TokenProvider
}
