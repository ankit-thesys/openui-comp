# Project glossary

| Term             | Meaning                                                                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React components | `@openuidev/react-components`: shared reusable React components, charts and theme APIs. Applications install it explicitly as the chat kit’s required peer.                                                |
| Chat kit         | `@openuidev/chat-kit`, implemented in `packages/kits/chat`. The root exports FollowUpBlock, FollowUpItem and ModelSwitcher plus their existing public types. `/libs` exports the existing AI library APIs. |
| Kits grouping    | `packages/kits` organizes independent packages. It is not a publishable umbrella package.                                                                                                                  |
| Chat library     | The existing 84-entry OpenUI component registry and associated prompt exports at `@openuidev/chat-kit/libs`. It composes shared React components and chat-specific components.                             |
| Legacy React UI  | The existing `@openuidev/react-ui` package, preserved during the migration. Historical evidence retains its original package identities and hashes.                                                        |
| Dashboard kit    | Future work. No dashboard package or schema is implemented or published by the chat package move.                                                                                                          |
