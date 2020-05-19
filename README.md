# MLBD Chat Client

Javascript chat client for MLBD Chat Service.

[![Build Status](https://travis-ci.org/war1oc/mlbd-chat-client.svg?branch=master)](https://travis-ci.org/war1oc/mlbd-chat-client)

## Usage

### Installation

```bash
npm i @mlbd/chat-client
```

### Initialization

Initialize the client:

```javascript
import { ChatClient, TokenProvider } from '@mlbd/chat-client'

const chatClient = new ChatClient({
  chatApiEndpoint: "https://my-chat-api",
  tokenProvider: new TokenProvider({
    // This is a POST request configuration for fetching chat token
    url: "https://my-api/auth/chat",
    getHeaders: () => {
      // Optional
      // return a headers object your endpoint requires
      return Promise.resolve({ Authorization: "Bearer <ACCESS_TOKEN>" })
    },
    getBody: () => {
      // Optional
      // return a body object your endpoint requires
      return Promise.resolve({ key: "value" })
    }
  }),
  pusherOptions: {
    appKey: '<PUSHER_APP_KEY>',
    cluster: '<PUSHER_APP_CLUSTER>',
    forceTLS: true
  }
});
```

### Get my groups

```javascript
const myGroups = await chatClient.getMyGroups();
```

### Get group messages

```javascript
const messages = await chatClient.getGroupMessages("<group_id>");
```

### Send message to a group

```javascript
// either message or attachments must be provided.
const messages = await chatClient.sendMessage({
  groupId: "<group_id>",
  message: "hello, world!",
  attachments: [{
    title: "Laika - the dog",
    mime_type: "image/jpeg",
    url: "https://domain/laika.jpeg"
  }],
  parentMessageId: "<parent_message_id>",
  mentions: ["2", "3"]
});
```

### Get my stats

```javascript
const stats = await chatClient.getMyStats();
```

### Mark group as read

```javascript
await chatClient.markGroupAsRead({ groupId: "<group_id>"});
```

### Delete message

```javascript
await chatClient.deleteMessage("<message_id>");
```

### Get group

```javascript
const group = await chatClient.getGroup("<group_id>");
```

### Get message

```javascript
const message = await chatClient.getMessage("<message_id>");
```

### Search messages

```javascript
const messages = await chatClient.searchMessages({
  keyword: "<search_keyword>",
  // groupId is optional, results will be filtered by group if this is passed
  groupId: "<group_id>",
  // limit is optional, default: 10
  limit: 5,
  // offset is optional, default: 0
  offset: 5
});
```

`limit` and `offset` are to be used for pagination.

### Get group attachments

```javascript
const groupAttachments = await chatClient.getGroupAttachments("<group_id>", "<limit>", "<offset>");
```

### Add pinned message

```javascript
await chatClient.addPinnedMessage("<message_id>");
```

### Remove pinned message

```javascript
await chatClient.removePinnedMessage("<message_id>");
```

### Get group pinned messages

```javascript
const messages = await chatClient.getGroupPinnedMessages("<group_id>");
```

### Add saved message

```javascript
await chatClient.addSavedMessage("<message_id>");
```

### Remove saved message

```javascript
await chatClient.removeSavedMessage("<message_id>");
```

### Get saved messages

```javascript
const messages = await chatClient.getSavedMessages();
```

### Get group saved messages

```javascript
const messages = await chatClient.getGroupSavedMessages("<group_id>");
```

### Hooks

When a user logs in:

```javascript
await chatClient.connect();
```

When a user logs out:

```javascript
await chatClient.disconnect();
```

#### Message Received

```javascript
chatClient.onMessageRecieved((data: any) => {
  // You have a new message!
});
```

#### Added To A Group

```javascript
chatClient.onAddedToGroup((data: any) => {
  // You have been added to a group!
});
```

#### Group Updated

```javascript
chatClient.onGroupUpdated((data: any) => {
  // A group you are in has been updated!
});
```

#### Group Deleted

```javascript
chatClient.onGroupDeleted((data: any) => {
  // A group you were in has been deleted!
});
```

#### Group Member Added

```javascript
chatClient.onGroupMemberAdded((data: any) => {
  // A new member has been added to a group where you're in!
});
```

#### Group Member Removed

```javascript
chatClient.onGroupMemberRemoved((data: any) => {
  // A member has been removed from a group where you're in!
});
```

#### Message Deleted

```javascript
chatClient.onMessageDeleted((data: any) => {
  // A message has been deleted from a group where you're in!
});
```

#### Message Read

```javascript
chatClient.onMessageRead((data: any) => {
  // A message has been read in a group where you're in!
});
```

#### Message Updated

```javascript
chatClient.onMessageUpdated((data: any) => {
  // A message has been updated in a group where you're in!
});
```

#### Pinned Message Added

```javascript
chatClient.onPinnedMessageAdded((data: any) => {
  // A message has been pinned in a group where you're in!
});
```

#### Pinned Message Removed

```javascript
chatClient.onPinnedMessageRemoved((data: any) => {
  // A message has been unpinned in a group where you're in!
});
```

#### Saved Message Added

```javascript
chatClient.onSavedMessageAdded((data: any) => {
  // A message has been saved!
});
```

#### Saved Message Removed

```javascript
chatClient.onSavedMessageRemoved((data: any) => {
  // A message has been unsaved!
});
```

## Developing

### NPM scripts

- `npm t`: Run test suite
- `npm start`: Run `npm run build` in watch mode
- `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
- `npm run test:prod`: Run linting and generate coverage
- `npm run build`: Generate bundles and typings, create docs
- `npm run lint`: Lints code
- `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)

### Excluding peerDependencies

On library development, one might want to set some peer dependencies, and thus remove those from the final bundle. You can see in [Rollup docs](https://rollupjs.org/#peer-dependencies) how to do that.

Good news: the setup is here for you, you must only include the dependency name in `external` property within `rollup.config.js`. For example, if you want to exclude `lodash`, just write there `external: ['lodash']`.

### Automatic releases

_**Prerequisites**: you need to create/login accounts and add your project to:_

- [npm](https://www.npmjs.com/)
- [Travis CI](https://travis-ci.org)
- [Coveralls](https://coveralls.io)

_**Prerequisite for Windows**: Semantic-release uses
**[node-gyp](https://github.com/nodejs/node-gyp)** so you will need to
install
[Microsoft's windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)
using this command:_

```bash
npm install --global --production windows-build-tools
```

#### Setup steps

Follow the console instructions to install semantic release and run it (answer NO to "Do you want a `.travis.yml` file with semantic-release setup?").

_Note: make sure you've setup `repository.url` in your `package.json` file_

```bash
npm install -g semantic-release-cli
semantic-release-cli setup
# IMPORTANT!! Answer NO to "Do you want a `.travis.yml` file with semantic-release setup?" question. It is already prepared for you :P
```

From now on, you'll need to use `npm run commit`, which is a convenient way to create conventional commits.

Automatic releases are possible thanks to [semantic release](https://github.com/semantic-release/semantic-release), which publishes your code automatically on [github](https://github.com/) and [npm](https://www.npmjs.com/), plus generates automatically a changelog. This setup is highly influenced by [Kent C. Dodds course on egghead.io](https://egghead.io/courses/how-to-write-an-open-source-javascript-library)

### Git Hooks

There is already set a `precommit` hook for formatting your code with Prettier :nail_care:

By default, there are two disabled git hooks. They're set up when you run the `npm run semantic-release-prepare` script. They make sure:

- You follow a [conventional commit message](https://github.com/conventional-changelog/conventional-changelog)
- Your build is not going to fail in [Travis](https://travis-ci.org) (or your CI server), since it's runned locally before `git push`

This makes more sense in combination with [automatic releases](#automatic-releases)

### FAQ

#### `Array.prototype.from`, `Promise`, `Map`... is undefined

TypeScript or Babel only provides down-emits on syntactical features (`class`, `let`, `async/await`...), but not on functional features (`Array.prototype.find`, `Set`, `Promise`...), . For that, you need Polyfills, such as [`core-js`](https://github.com/zloirock/core-js) or [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/) (which extends `core-js`).

For a library, `core-js` plays very nicely, since you can import just the polyfills you need:

```javascript
import "core-js/fn/array/find"
import "core-js/fn/string/includes"
import "core-js/fn/promise"
...
```
