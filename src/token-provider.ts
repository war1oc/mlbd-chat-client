import jwt_decode from 'jwt-decode'
import xhr from 'xhr'

export class TokenProvider {
  private options: TokenProviderOptions
  private chatUserToken: any

  constructor(options: TokenProviderOptions) {
    this.options = options
    this.chatUserToken = ''
  }

  public async getAuthToken(): Promise<any> {
    if (!this.chatUserToken) {
      this.chatUserToken = await this.fetchAuthToken()
      return this.chatUserToken
    }

    const token: any = jwt_decode(this.chatUserToken)
    if (Date.now() >= token.exp * 1000) {
      this.chatUserToken = await this.fetchAuthToken()
    }

    return this.chatUserToken
  }

  public async getUserId(): Promise<any> {
    const chatUserToken = await this.getAuthToken()
    const decodedToken: any = jwt_decode(chatUserToken)
    return decodedToken.user_id
  }

  private async fetchAuthToken(): Promise<any> {
    const headers = await this.options.getHeaders()

    return new Promise((resolve, reject) => {
      xhr(
        {
          method: 'POST',
          uri: `${this.options.url}`,
          headers: headers,
          json: true
        },
        (err, resp, body) => {
          if (err) {
            return reject(err)
          }

          return resolve(body['access_token'])
        }
      )
    })
  }
}

export interface TokenProviderOptions {
  url: string
  getHeaders(): Promise<any>
}
