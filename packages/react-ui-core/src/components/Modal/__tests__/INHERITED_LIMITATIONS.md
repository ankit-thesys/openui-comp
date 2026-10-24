# Inherited overlay observations

Baseline `bd1bcf5db`; extracted source `fb46c2103`. The final installed-package Chrome matrix reproduced the same observations in legacy and extracted arms for plain CSS, Tailwind v3/v4 and both stylesheet orders. These comparisons demonstrate inheritance, not successful desired accessibility behavior or automatic approval to keep every limitation.

- **Modal focus escapes:** Tab can leave the open dialog. The source focuses its content initially but has no trap.
- **Modal focus is not restored:** Escape while focus is inside closes the dialog without returning focus to its opener.
- **Nested labels collide:** both dialogs use `openui-modal-title`. The nested dialog's visible title is “Nested review” but its aria-labelledby resolves to the parent's “Review”.
- **Tooltip truncation replaces its child ref:** the consumer's native button ref becomes null when showOnlyWhenTruncated clones the child with its own ref.
- **Composed pointer-leave observation:** after leaving a tooltip inside Modal and focusing the dialog, one tooltip remains mounted at the sampled settled point. A prior sampler waiting seven seconds also did not see detachment. Both arms behave alike. Parent unmount removes it; standalone Escape, outside-click and trigger-click dismissal checks pass. This observation is not attributed to Goober or declared an upstream defect without further isolation.

In this fixture, Escape from a nested dialog leaves the parent open; that behavior is preserved and is not listed as a defect. Raw inherited observations appear separately in results/browser-final.json.

No focus manager, title-ID redesign, child-ref composition change, Radix migration or legacy fix was implemented. Review these limitations before claiming an accessible modal or complete ref preservation. Any new-package correction should be a separately reviewed conventional change; the old package stays read-only.
