import { HorizontalBarChart, ThemeProvider, openuiChatLibrary } from "@openuidev/react-ui";
import "@openuidev/react-ui/styles/index.css";
import { mountPane } from "./frame";
mountPane({ library: openuiChatLibrary, ThemeProvider, HorizontalBarChart });
