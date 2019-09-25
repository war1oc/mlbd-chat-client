import { ChatClient, ChatClientOptions } from "../src/chat-js-client"

/**
 * ChatClient test
 */
describe("ChatClient test", () => {
  let chatClient: ChatClient;

  beforeEach(() => {
    const options: ChatClientOptions = {
      chatApiEndpoint: "CHAT_API_ENDPOINT"
    };
    chatClient = new ChatClient(options);
  });

  it("passes this test", () => {
    expect(true).toBeTruthy();
  });
});
