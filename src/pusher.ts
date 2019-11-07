import * as Pusher from 'pusher-js'

export class PusherProvider {
  public options: IPusherOptions
  private userId: string
  private pusher: Pusher.Pusher

  constructor(options: IPusherOptions) {
    this.options = options
    this.pusher = new Pusher(this.options.appKey, {
      cluster: this.options.cluster,
      authEndpoint: this.options.authEndpoint,
      forceTLS: this.options.forceTLS
    })
    this.userId = ''
  }

  public connect(userId: string) {
    this.pusher.subscribe(`private-${userId}`)
    this.userId = userId
  }

  public disconnect() {
    this.pusher.unsubscribe(this.userId)
  }
}

export interface IPusherOptions {
  appKey: string
  cluster: string
  forceTLS: boolean
  authEndpoint: string
}
