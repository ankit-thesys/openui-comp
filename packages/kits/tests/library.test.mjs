import { openuiChatLibrary } from "@openuidev/kits/react/chat/libs";
import assert from "node:assert/strict";
import test from "node:test";

test("chat library generates a prompt containing its existing Card and FollowUp contracts", () => {
  const prompt = openuiChatLibrary.prompt();
  assert.match(prompt, /Card/);
  assert.match(prompt, /FollowUpBlock/);
  assert.match(prompt, /FollowUpItem/);
});
