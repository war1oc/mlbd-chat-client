// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
  // import "core-js/fn/array.find"
  // ...
export class ChatClient {
  private options: ChatClientOptions;

  constructor(options: ChatClientOptions) {
    this.options = options;
  }
}

export interface ChatClientOptions {
  chatApiEndpoint: string
}
