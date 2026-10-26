import { HorizontalBarChart, ThemeProvider } from "@openuidev/react-components";
import { openuiChatLibrary } from "@openuidev/kits/react/chat/libs";
import { mountPane } from "./frame";
mountPane({ library: openuiChatLibrary, ThemeProvider, HorizontalBarChart });
