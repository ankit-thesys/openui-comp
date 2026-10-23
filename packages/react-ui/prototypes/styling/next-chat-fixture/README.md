# Actual chat store inside Next

Separate fixture and build from next-real-fixture. Owns ports 4189/4191 during checks. Uses unchanged `real/chat.tsx` FullChat, actual AgentInterface/ChatProvider/store/composer/parser, a local AG-UI backend and Next streaming proxy route handlers.

After installing parent/real/existing-next-fixture dependencies and building `.real-dist` plus `.chat-dist`:

```sh
node scripts/prepare-next-chat.mjs
npm run build --prefix next-chat-fixture
node scripts/check-next-chat.mjs
```

Preparation creates a separate `results/next-chat-build.json` source manifest. Checker always writes `results/next-chat.json`, including on failure. It refuses occupied ports and stops owned processes. `entry.tsx` exposes observations from the real store and calls its cancellation method during route cleanup. The proxy ties upstream cancellation to incoming request abort and downstream stream cancellation.
