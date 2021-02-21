import Pusher from 'pusher-js'
import { TokenProvider } from './token-provider'

export class PusherProvider {
  public options: IPusherProviderOptions
  private userId: string
  private pusher: Pusher

  constructor(options: IPusherProviderOptions) {
    this.options = options
    this.userId = ''

    this.pusher = new Pusher(this.options.appKey, {
      cluster: this.options.cluster,
      authEndpoint: this.options.authEndpoint,
      forceTLS: this.options.forceTLS,
    })
  }

  public async connect(userId: string) {
    this.pusher.config.auth = {
      headers: {
        Authorization: `Bearer ${await this.options.tokenProvider.getAuthToken()}`,
      },
    }

    this.pusher.subscribe(`private-${userId}`)
    this.userId = userId
  }

  public disconnect() {
    this.pusher.unsubscribe(`private-${this.userId}`)
  }

  public bind(event: string, cb: (data: any) => void) {
    this.pusher.bind(event, cb)
  }
}

export interface IPusherProviderOptions {
  appKey: string
  cluster: string
  forceTLS: boolean
  authEndpoint: string
  tokenProvider: TokenProvider
}
