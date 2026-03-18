## 2026-03-18 - Interactive Custom Radio Button Groups
**Learning:** When using custom UI elements as radio buttons (like the difficulty selector), visual state changes are insufficient. Screen readers need explicit attributes like `role="group"`, `aria-label`, and `aria-pressed` to understand the current selection state.
**Action:** Always ensure custom selection groups use `aria-pressed` or `aria-current` to communicate the active item.
