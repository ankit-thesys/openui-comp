import {
  Button,
  Input,
  TextArea,
  type ButtonProps,
  type InputProps,
  type TextAreaProps,
} from "@openuidev/react-ui-core";
import { createRef } from "react";

const button: ButtonProps = {
  variant: "secondary",
  size: "extra-small",
  buttonType: "destructive",
  type: "submit",
  iconLeft: <span>Icon</span>,
  style: { padding: 12 },
};
const input: InputProps = {
  size: "large",
  styles: { padding: 12 },
  style: { padding: 15 },
  hasError: false,
  onChange: (event) => event.currentTarget.value,
};
const textarea: TextAreaProps = {
  rows: 5,
  hasError: true,
  style: { padding: 20 },
  onChange: (event) => event.currentTarget.value,
};
export const controls = (
  <>
    <Button {...button} ref={createRef<HTMLButtonElement>()}>
      Save
    </Button>
    <Input {...input} ref={createRef<HTMLInputElement>()} />
    <TextArea {...textarea} ref={createRef<HTMLTextAreaElement>()} />
  </>
);

// Existing string sizes remain distinct from the native numeric input size.
// @ts-expect-error numeric Input size is not part of the existing API
export const invalidInput: InputProps = { size: 12 };
// @ts-expect-error there is no new sx API
export const invalidButton: ButtonProps = { sx: { color: "red" } };
