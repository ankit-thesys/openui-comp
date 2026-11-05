# @openuidev/intelligent-ui-library

An OpenUI component library for Intelligent UI answers: the components, `@functions`, prompt
options and examples a model uses to compose them.

## Install

```sh
pnpm add @openuidev/intelligent-ui-library
```

## Usage

Generate the system prompt with the CLI from a file that re-exports the library:

```ts
// src/lib/intelligent-ui-library.ts
export { library, promptOptions } from "@openuidev/intelligent-ui-library";
```

```sh
npx @openuidev/cli generate src/lib/intelligent-ui-library.ts --out src/generated/system-prompt.txt
```

Send that file as the system message, then render the model's response:

```tsx
import { library, runLibraryAction } from "@openuidev/intelligent-ui-library";
import { ThemeProvider } from "@openuidev/react-components";
import { Renderer, type ActionEvent } from "@openuidev/react-lang";

export function IntelligentMessage({
  response,
  onAction,
}: {
  response: string;
  onAction: (event: ActionEvent) => void;
}) {
  return (
    <ThemeProvider mode="dark">
      <Renderer
        response={response}
        library={library}
        onAction={(event) => {
          // The library's own action runs here; the rest are yours.
          if (runLibraryAction(event) === null) onAction(event);
        }}
      />
    </ThemeProvider>
  );
}
```

`ThemeProvider` from `@openuidev/react-components` is optional. It sets the mode (light by default)
and takes `lightTheme` and `darkTheme` overrides. Without it, a response with a `Col` root uses the
light default theme.

`ThemeProvider` sets the theme's colour variables but doesn't paint your page. Give the page the
theme's background, for example `body { background: var(--openui-background); }`, so a dark
theme's text sits on a dark page.

### Actions

The `Renderer` hands every action a user takes to `onAction`. Most of them are yours to run:
`continue_conversation` sends a message back to the model, and `open_url` opens a link.

The library adds one action of its own, `CopyToClipboard`. The model uses it for buttons like "Copy
list". A library action carries no code, so the library exports `runLibraryAction` to run it. Call it
first in `onAction`:

- For `CopyToClipboard`, it copies the text and returns a promise of whether the copy worked.
- For any other action, it returns `null` and does nothing, so pass the event to your own handler.

Without `runLibraryAction`, a copy button does nothing.

## Components

`Col` is the root. 52 components in 6 groups:

| Group          | Components                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout         | `Col`, `Row`, `Box`, `Grid`, `Card`, `Carousel`, `Popover`, `Divider`, `Spacer`                                                                           |
| Text           | `Title`, `Text`, `Caption`, `Label`, `Badge`, `Link`, `List`, `ListItem`, `Markdown`, `Quote`, `Code`, `Math`                                             |
| Inputs         | `Button`, `IconButton`, `Pressable`, `Input`, `TextArea`, `Select`, `SegmentedControl`, `Slider`, `Checkbox`, `RadioGroup`, `DatePicker`, `Timer`, `Form` |
| Media and data | `Image`, `Icon`, `Table`, `Chart`, `YouTube`                                                                                                              |
| Play           | `Flashcard`, `Celebration`                                                                                                                                |
| Drawing        | `Svg`, `G`, `Circle`, `Ellipse`, `Rect`, `Line`, `Path`, `Polyline`, `Polygon`, `SvgText`, `HtmlView`                                                     |

The library also has 59 `@functions` that let an answer compute with its own state. The generated
system prompt lists them all.
