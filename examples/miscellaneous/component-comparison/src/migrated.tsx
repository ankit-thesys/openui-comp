import { HorizontalBarChart, ThemeProvider } from "@openuidev/react-components";
import { openuiChatLibrary } from "@openuidev/chat-kit/libs";
import { mountPane } from "./frame";
mountPane({ library: openuiChatLibrary, ThemeProvider, HorizontalBarChart });
