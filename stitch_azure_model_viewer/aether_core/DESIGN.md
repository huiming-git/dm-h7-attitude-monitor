# Design System Strategy: High-End Desktop Visualization

## 1. Overview & Creative North Star: "The Precision Gallery"

This design system is built to transform a technical utility into a high-end editorial experience. Our Creative North Star is **"The Precision Gallery."** We treat the 3D viewport not as a software window, but as a curated exhibition space. 

To move beyond the "standard SaaS" look, we reject the rigid, boxed-in grids common in engineering tools. Instead, we utilize **intentional asymmetry** and **tonal depth**. By prioritizing white space as a functional element rather than "empty" space, we create a sense of high-tech luxury. The interface should feel like it was designed by an architect: clean lines, substantial breathing room, and a relentless focus on the object of study—the 3D model.

---

## 2. Colors: Tonal Architecture

Our palette moves away from flat application of color, focusing instead on light-refraction and subtle shifts in temperature.

*   **Primary (`#0058bc`):** Reserved for moments of definitive action and brand presence. Use `primary-container` (`#0070eb`) for interactive states to provide a sense of digital glow.
*   **Neutral Foundation:** We rely on the `surface` series (`#f9f9f9` to `#ffffff`) to define the environment. 

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off UI areas. Traditional borders create visual noise that distracts from the 3D model. Boundaries must be defined solely through background color shifts. For example, a sidebar using `surface-container-low` (`#f3f3f3`) should sit flush against a `surface` (`#f9f9f9`) viewport.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers—fine paper or frosted glass.
*   **Base:** `surface` (The canvas).
*   **Secondary Elements:** `surface-container` (Sidebars and persistent panels).
*   **Floating Elements:** `surface-container-lowest` (#ffffff) (Active cards or pop-overs).

### The "Glass & Gradient" Rule
To achieve a "high-tech" feel, use **Glassmorphism** for floating toolbars. Use `surface-container-lowest` with a 70% opacity and a `20px` backdrop-blur. This allows the 3D environment to bleed through the UI, making the interface feel integrated into the 3D space rather than "pasted" on top. For primary CTAs, use a subtle linear gradient from `primary` to `primary-container` at a 135-degree angle to add "soul" and depth.

---

## 3. Typography: Editorial Precision

The typography system pairs the technical clarity of **Inter** with the characterful, modern geometry of **Manrope**.

*   **The Hero (Manrope):** Used for `display` and `headline` scales. Its wide stance and geometric apertures convey a professional, high-end architectural feel. Use `headline-lg` for project titles to anchor the layout.
*   **The Utility (Inter):** Used for `title`, `body`, and `label` scales. Inter is chosen for its exceptional readability in dense data environments (like coordinate systems or layer lists).
*   **Hierarchy Note:** Maintain high contrast in scale. A `display-md` title paired with a `label-md` metadata string creates an editorial look that feels more "designed" than standard balanced sizes.

---

## 4. Elevation & Depth: Tonal Layering

We avoid traditional "shadow-heavy" UI. Depth is an exercise in subtlety.

*   **The Layering Principle:** Achieve lift by "stacking" tones. Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a natural, soft lift visible to the eye but invisible to the subconscious.
*   **Ambient Shadows:** When an element must float (e.g., a context menu), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(26, 28, 28, 0.06)`. Note the color: we use a tint of `on-surface` at 6% opacity, never pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast modes), use a "Ghost Border": the `outline-variant` token at 15% opacity. High-contrast, 100% opaque borders are strictly forbidden.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (Primary to Primary-Container), `DEFAULT` (0.25rem) radius, white text. No border.
*   **Secondary:** `surface-container-highest` fill with `on-surface` text. Feels grounded and archival.
*   **Tertiary:** Ghost style. Use `primary` text. Interaction state uses a `primary-fixed-dim` background at 10% opacity.

### 3D Viewport Controls (Context Specific)
*   **Floating Gizmos:** Use the Glassmorphism rule. Circular shapes for rotation, square for scale. 
*   **Sidebars:** No dividers. Use `title-sm` in `on-surface-variant` for section headers, with 24px of top margin to create separation through whitespace.

### Input Fields
*   **Sleek Text Inputs:** Minimalist "Underline" style or subtle `surface-container-high` fill. When focused, use a 2px `primary` bottom border—never a full-box focus ring.

### Cards & Lists
*   **The "No-Divider" Rule:** Forbid the use of horizontal lines. Separate list items using the spacing scale (e.g., 8px vertical gaps) or a subtle hover state shift to `surface-container-highest`.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Align the main 3D model slightly off-center if the sidebar is open to maintain visual equilibrium.
*   **Use Large Type Scales:** Use `display-sm` for empty states to make the application feel like a premium gallery.
*   **Apply Micro-interactions:** Every hover state should be a soft transition (200ms ease-out) of background color, never an instant snap.

### Don't:
*   **Don't use "Pure" Black:** Use `on-surface` (#1a1c1c) for text to keep the "White" brand feeling soft and premium.
*   **Don't use Standard Shadows:** Avoid the "fuzzy grey" look. If it's not an ambient shadow (6% opacity), it doesn't belong in this system.
*   **Don't Over-Round:** Stick to the `DEFAULT` (4px) or `md` (6px) roundedness for functional components. Only use `full` for chips and icon button backgrounds. Extreme rounding (pill shapes) on large cards breaks the "professional/high-tech" aesthetic.