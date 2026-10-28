---
"@openuidev/react-components": minor
---

Migrate Image, ImageBlock, ImageText, ImageTextLarge, ImageGallery (including its modal) and Carousel to flat, render-time styles with stable classes and optional cascade layers. Image geometry that Radix set inline is now CSS defaults, error, loading and layout states use attributes, and Carousel buttons forward consumer `className`, `style` and ref to the actual button. See the README migration table for renamed classes.
