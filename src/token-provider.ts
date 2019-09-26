import * as request from "request-promise-native";
import * as jwt_decode from "jwt-decode";

export class TokenProvider {
  private options: TokenProviderOptions
  private chatUserToken: string;

  constructor(options: TokenProviderOptions) {
    this.options = options;
    this.chatUserToken = "";
  }

  public async getAuthToken() {
    if (!this.chatUserToken) {
      await this.fetchAuthToken();
    }

    const token: any = jwt_decode(this.chatUserToken);
    if (Date.now() >= token.exp * 1000) {
      await this.fetchAuthToken();
    }

    return this.chatUserToken;
  }

  private async fetchAuthToken() {
    const headers = await this.options.getHeaders();
    const result = await request.post({
      uri: this.options.url,
      headers: headers
    });

    this.chatUserToken = result["access_token"];
  }
}

export interface TokenProviderOptions {
  url: string
  getHeaders(): Promise<any>
}
