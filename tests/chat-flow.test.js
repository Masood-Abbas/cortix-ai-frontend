import test from "node:test";
import assert from "node:assert/strict";
import { configureStore } from "@reduxjs/toolkit";
import api from "../utils/axios.js";
import user, { setUserData } from "../src/redux/userSlice.js";
import conversation, { setSelectedConversation, setConvTitle, setConversations } from "../src/redux/conversationSlice.js";
import message, { selectActiveArtifact, selectMessages, setSelectedArtifact } from "../src/redux/messageSlice.js";
import { loadMessages, sendChatMessage } from "../features/chatActions.js";

const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};
const makeStore = () => {
  const store = configureStore({ reducer: { user, conversation, message } });
  store.dispatch(setUserData({ _id: "owner" }));
  return store;
};
const select = (store, id, title = "Existing chat") => store.dispatch(setSelectedConversation(id ? { _id: id, title } : null));
const mockApi = (handler) => {
  api.defaults.adapter = async (config) => ({ data: await handler(config), status: 200, statusText: "OK", headers: {}, config });
};

test("New Chat and a newly created conversation never display previous messages", async () => {
  const store = makeStore();
  mockApi(() => [{ role: "user", content: "old private message" }]);
  select(store, "old");
  await store.dispatch(loadMessages("old"));
  assert.equal(selectMessages(store.getState()).length, 1);
  select(store, null);
  assert.deepEqual(selectMessages(store.getState()), []);
  select(store, "new", "New Chat");
  assert.deepEqual(selectMessages(store.getState()), []);
});

test("login and restored sessions use the same user identity; logout clears messages", async () => {
  const store = makeStore();
  store.dispatch(setUserData({ user: { _id: "owner", name: "Test user" } }));
  select(store, "a");
  store.dispatch(setUserData({ userId: "owner", name: "Test user" }));
  assert.equal(store.getState().user.userData._id, "owner");
  assert.equal(store.getState().conversation.selectedConversation._id, "a");
  store.dispatch(setUserData(null));
  assert.equal(store.getState().conversation.selectedConversation, null);
});

test("out-of-order history responses stay attached to their conversations", async () => {
  const store = makeStore();
  const first = deferred();
  mockApi(({ url }) => url.endsWith("/a") ? first.promise : [{ content: "B", role: "user" }]);
  select(store, "a");
  const request = store.dispatch(loadMessages("a"));
  select(store, "b");
  await store.dispatch(loadMessages("b"));
  first.resolve([{ content: "A", role: "user" }]);
  await request;
  assert.equal(selectMessages(store.getState())[0].content, "B");
});

test("only the most recent history request wins, and titles do not skip loading", async () => {
  const store = makeStore();
  const first = deferred();
  let calls = 0;
  mockApi(() => ++calls === 1 ? first.promise : [{ role: "user", content: "latest" }]);
  select(store, "a", "New Chat");
  const oldRequest = store.dispatch(loadMessages("a"));
  await store.dispatch(loadMessages("a"));
  first.resolve([{ content: "stale", role: "user" }]);
  await oldRequest;
  store.dispatch(setConvTitle({ conversationId: "a", title: "Renamed" }));
  assert.equal(selectMessages(store.getState())[0].content, "latest");
});

test("late replies cannot appear in a different chat or a new draft", async () => {
  const store = makeStore();
  const reply = deferred();
  mockApi(() => reply.promise);
  select(store, "a");
  const sending = store.dispatch(sendChatMessage({ conversationId: "a", prompt: "hello" }));
  select(store, null);
  reply.resolve("reply for A");
  await sending;
  assert.deepEqual(selectMessages(store.getState()), []);
  select(store, "b");
  assert.deepEqual(selectMessages(store.getState()), []);
  select(store, "a");
  assert.deepEqual(selectMessages(store.getState()).map((item) => item.content), ["hello", "reply for A"]);
});

test("double send is blocked and history cannot replace an in-flight prompt", async () => {
  const store = makeStore();
  const reply = deferred();
  let requests = 0;
  mockApi(() => { requests++; return reply.promise; });
  select(store, "a");
  const first = store.dispatch(sendChatMessage({ conversationId: "a", prompt: "hello" }));
  const second = await store.dispatch(sendChatMessage({ conversationId: "a", prompt: "duplicate" }));
  const history = await store.dispatch(loadMessages("a"));
  assert.equal(second.meta.condition, true);
  assert.equal(history.meta.condition, true);
  assert.equal(requests, 1);
  reply.resolve("answer");
  await first;
  assert.equal(selectMessages(store.getState()).length, 2);
});

test("new chat creation does not hijack navigation; delayed sidebar lists retain it", async () => {
  const store = makeStore();
  const created = deferred();
  mockApi(({ url }) => url.includes("create-conversation") ? created.promise : url.includes("update-conversation") ? {} : "answer");
  const request = store.dispatch(sendChatMessage({ prompt: "first question" }));
  select(store, null);
  created.resolve({ _id: "new", title: "New Chat" });
  await request;
  assert.equal(store.getState().conversation.selectedConversation, null);
  store.dispatch(setConversations([]));
  assert.equal(store.getState().conversation.conversations[0]._id, "new");
  assert.equal(store.getState().message.byConversation.new.items.length, 2);
});

test("title failure still sends the prompt; send failures never append null responses", async () => {
  const store = makeStore();
  mockApi(({ url }) => {
    if (url.includes("create-conversation")) return { _id: "new", title: "New Chat" };
    if (url.includes("update-conversation")) throw new Error("title unavailable");
    return "answer";
  });
  await store.dispatch(sendChatMessage({ prompt: "hello" }));
  assert.equal(selectMessages(store.getState()).length, 2);
  mockApi(() => { throw new Error("service unavailable"); });
  await store.dispatch(sendChatMessage({ conversationId: "new", prompt: "again" }));
  assert.equal(selectMessages(store.getState()).length, 3);
  assert.ok(store.getState().message.byConversation.new.error);
  assert.equal(store.getState().message.sendRequestId, null);
});

test("logout clears history and ignores replies from the old session", async () => {
  const store = makeStore();
  const reply = deferred();
  mockApi(() => reply.promise);
  select(store, "a");
  const request = store.dispatch(sendChatMessage({ conversationId: "a", prompt: "private" }));
  store.dispatch(setUserData(null));
  store.dispatch(setUserData({ _id: "different-owner" }));
  reply.resolve("private response");
  await request;
  assert.deepEqual(store.getState().message.byConversation, {});
  assert.deepEqual(store.getState().conversation.conversations, []);
});

test("failed or aborted history cannot crash the UI or restore cleared sessions", async () => {
  const store = makeStore();
  select(store, "a");
  mockApi(() => null);
  await store.dispatch(loadMessages("a"));
  assert.deepEqual(selectMessages(store.getState()), []);
  assert.ok(store.getState().message.byConversation.a.error);
  const pending = deferred();
  mockApi(() => pending.promise);
  const request = store.dispatch(loadMessages("a"));
  store.dispatch(setUserData(null));
  pending.resolve([{ role: "user", content: "old account" }]);
  await request;
  assert.deepEqual(store.getState().message.byConversation, {});
});

test("artifact panel defaults to latest artifact and can select previous generated code", async () => {
  const store = makeStore();
  select(store, "a");
  mockApi(({ url }) => {
    if (url.includes("get-messge")) {
      return [
        {
          role: "assistant",
          content: "first",
          artifacts: [{ id: "old", title: "Old", files: [{ name: "index.html", content: "old" }] }],
        },
        {
          role: "assistant",
          content: "second",
          artifacts: [{ id: "new", title: "New", files: [{ name: "index.html", content: "new" }] }],
        },
      ];
    }
    return {};
  });
  await store.dispatch(loadMessages("a"));
  assert.equal(selectActiveArtifact(store.getState()).id, "new");
  store.dispatch(setSelectedArtifact("old"));
  assert.equal(selectActiveArtifact(store.getState()).id, "old");
});
