import { ThemeProvider } from "@openuidev/react-ui-core";
import { openuiChatLibrary } from "@openuidev/kits/react/chat/libs";
import { mountPane } from "./frame";
mountPane({ library: openuiChatLibrary, ThemeProvider });
