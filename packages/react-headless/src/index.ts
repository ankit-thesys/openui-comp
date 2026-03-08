export { ChatProvider } from "./store/ChatProvider";
export { useThread, useThreadList } from "./store/hooks";

export { MessageContext, MessageProvider, useMessage } from "./hooks/useMessage";
export {
  agUIAdapter,
  openAIAdapter,
  openAIConversationMessageFormat,
  openAIMessageFormat,
  openAIReadableStreamAdapter,
  openAIResponsesAdapter,
} from "./stream/adapters";
export { processStreamedMessage } from "./stream/processStreamedMessage";

export type {
  ChatProviderProps,
  ChatStore,
  CreateMessage,
  Thread,
  ThreadActions,
  ThreadListActions,
  ThreadListState,
  ThreadState,
} from "./store/types";

export type {
  ActivityMessage,
  AssistantMessage,
  BinaryInputContent,
  DeveloperMessage,
  FunctionCall,
  InputContent,
  Message,
  ReasoningMessage,
  SystemMessage,
  TextInputContent,
  ToolCall,
  ToolMessage,
  UserMessage,
} from "./types/message";

export { identityMessageFormat } from "./types/messageFormat";
export type { MessageFormat } from "./types/messageFormat";
export { EventType } from "./types/stream";
export type { AGUIEvent, StreamProtocolAdapter } from "./types/stream";
