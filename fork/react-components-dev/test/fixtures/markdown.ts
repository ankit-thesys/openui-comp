// All supported markdown elements, including loose/nested lists and structural neighbours.
export const markdown = `# Heading one

First paragraph with **strong**, *emphasis*, ~~deletion~~, [a link](https://example.com), and \`inline code\`.

Second paragraph with a hard break  
and another line.

## Heading two

### Heading three

#### Heading four

##### Heading five

###### Heading six

- First item
- Second item
  - Nested bullet
  - Another bullet
    1. Nested number

1. Numbered item
2. Another item

   A loose paragraph.

   Another loose paragraph.

> Quote with **strong**, *emphasis*, [a link](https://example.com), and \`quoted code\`.
>
> **Strong with [a link](https://example.com) and \`code\`.**
>
> Second quoted paragraph.

---

Paragraph after a rule.

\`\`\`js
const answer = 42;
console.log(answer);
\`\`\`

\`\`\`
Plain fenced code
\`\`\`

    Indented code

| Left | Center | Right |
| :--- | :----: | ----: |
| First | Middle | Last |
| **Bold** | \`code\` | [Link](https://example.com) |

- [x] Checked task
- [ ] Unchecked task

![An image](data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='12'%20height='12'/%3E)

Final paragraph.
`;
