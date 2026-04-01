# Design System Strategy: Kinetic Industrialism

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Industrialist."** 

This is not a standard fitness app; it is a high-performance engine. We are moving away from the soft, rounded "lifestyle" aesthetic typical of the industry and leaning into a brutalist, editorial precision. By utilizing raw, sharp angles—inspired by the brand's signature 'WAY' wordmark—and a total rejection of traditional borders, we create a digital space that feels as uncompromising as a heavy lifting session.

The layout strategy relies on **intentional asymmetry**. We break the traditional grid by allowing high-impact typography to bleed across sections and using overlapping layers to create a sense of forward momentum. This is a system built for speed, depth, and peak performance.

---

### 2. Colors: Tonal Depth & High-Vis Energy

Our palette is anchored in deep obsidian and industrial greys, punctuated by a singular, high-vis accent.

*   **Primary Accent (`#f3ffca` / `#cafd00`):** This is our "Electric Acid" energy. Use it sparingly but with high impact for CTAs, progress indicators, and critical performance metrics. 
*   **The "No-Line" Rule:** We do not use 1px solid borders to separate content. In this system, boundaries are defined by **Background Shifts**. A section in `surface-container-low` (#131313) sitting on a `background` (#0e0e0e) provides all the distinction required.
*   **Surface Hierarchy & Nesting:** Treat the UI as a series of physical plates. 
    *   **Level 0 (Background):** `#0e0e0e` (Base environment)
    *   **Level 1 (Sectioning):** `surface-container` (#1a1a1a)
    *   **Level 2 (Active Cards):** `surface-container-high` (#20201f)
*   **The "Glass & Gradient" Rule:** To avoid a flat, "template" look, floating modals or performance overlays should use **Glassmorphism**. Combine `surface` colors at 70% opacity with a `24px` backdrop blur. For primary CTAs, apply a subtle linear gradient from `primary` (#f3ffca) to `primary-container` (#cafd00) at a 45-degree angle to simulate the sheen of high-tech athletic gear.

---

### 3. Typography: Industrial Editorial

Typography is the primary driver of our brand’s "Industrial" voice.

*   **Display & Headlines (Lexend):** We use Lexend for its geometric, high-stability feel. `display-lg` (3.5rem) should be used for hero statements, often set in All Caps to mimic the "WAY" wordmark’s authority.
*   **The Technical Layer (Space Grotesk):** For labels and data points (the "Performance Tracking" elements), we use Space Grotesk. Its quirky, technical character suggests precision and scientific tracking.
*   **The Narrative Layer (Inter):** Inter handles the heavy lifting of Titles and Body copy. It provides the necessary readability contrast against the aggressive headline styles.
*   **Visual Rhythm:** Pair a massive `display-md` headline with a tiny, tracked-out `label-sm` in the primary accent color to create a high-fashion, editorial contrast.

---

### 4. Elevation & Depth: Tonal Layering

We reject traditional material shadows in favor of **Tonal Layering** and **Ambient Glows**.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` (#000000) card nested within a `surface-container-high` (#20201f) area creates a recessed, "etched" look that feels premium and custom.
*   **Ambient Shadows:** If a card must float (e.g., a "Start Workout" button), use an extra-diffused shadow. 
    *   *Shadow Setting:* `0px 20px 40px rgba(0, 0, 0, 0.4)` tinted with the `on-surface` hue.
*   **The "Ghost Border" Fallback:** If a container is placed on an image background, use the `outline-variant` token at **15% opacity**. This creates a "breath" of a border rather than a hard line.
*   **Angular Cutouts:** In reference to the logo, avoid `0px` roundedness (as per the scale) but experiment with **clipped corners** on cards to reinforce the sharp, high-performance visual language.

---

### 5. Components: Precision Tools

*   **Performance Buttons:** 
    *   **Primary:** Sharp edges (0px radius). Background: `primary` (#f3ffca). Text: `on-primary` (#516700). High-impact hover state: Glow effect using the primary color.
    *   **Tertiary:** Text-only in `primary`, with a `2px` underline that only spans 50% of the word’s width, aligned to the right.
*   **Stylized Workout Cards:** 
    *   Use `surface-container-low` as the base.
    *   No dividers. Use `spacing-8` (1.75rem) to separate the workout title from the rep count.
    *   Background images should have a `surface-dim` (#0e0e0e) overlay at 40% to ensure typography pop.
*   **Performance Charts:** 
    *   Lines should be `primary` (#f3ffca) with a thickness of `2px`.
    *   Area under the curve should use a gradient from `primary` at 20% opacity to `transparent` at the bottom.
*   **Input Fields:** 
    *   Forbid "box" inputs. Use a "Bottom-Line Only" approach using the `outline` token (#767575). On focus, the line transitions to `primary` and grows to `2px`.

---

### 6. Do's and Don'ts

#### Do:
*   **Do** use extreme scale. Pair very large typography with very small, technical labels.
*   **Do** use "Dead Space." Use `spacing-24` (5.5rem) to create dramatic pauses between content blocks.
*   **Do** utilize the `primary` accent for data-rich moments (e.g., heart rate, PRs).
*   **Do** ensure all imagery is high-contrast, desaturated, or black and white to match the brand's "Deep Black" aesthetic.

#### Don't:
*   **Don't** use any border-radius. Every corner in this system must be a sharp 90-degree angle (0px).
*   **Don't** use standard grey shadows. If it's not a tonal shift, it shouldn't be there.
*   **Don't** use generic iconography. Icons must be sharp, thin-stroke (1.5px), and follow the angularity of the "WAY" logo.
*   **Don't** use dividers or separators. If the content feels cluttered, increase the vertical spacing using the `spacing-12` token or higher.