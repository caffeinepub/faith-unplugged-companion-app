# Specification

## Summary
**Goal:** Apply a single, coherent high-contrast light theme across the app to eliminate unreadable/transparent text and ensure consistent, accessible readability.

**Planned changes:**
- Update global theme tokens in `frontend/src/index.css` (`:root` and `.dark` CSS variables used by Tailwind/shadcn) to a high-contrast, non-gradient-forward palette and remove/replace any global utility styles that force unreadable colors (e.g., white/transparent “on-gradient” text).
- Refactor `frontend/src/pages/LandingPage.tsx` to remove the current blue-to-purple gradient hero background and ensure all landing text (including the main description paragraph) and buttons/links render with solid, high-contrast colors.
- Audit and fix navigation and overlay readability in `frontend/src/components/Header.tsx`, including header buttons/icons and the mobile sheet menu content (all states + focus rings).
- Sweep remaining pages and common interactive patterns (Home, Devotion, Journal, Bible, Fasting, My Journey, Ministry, Settings) to replace hard-coded low-contrast/transparent styles with theme-token-based classes so text, placeholders, tabs, badges, dropdowns/selects/popovers, and separators remain readable.

**User-visible outcome:** All pages and UI elements use a consistent high-contrast light theme where text, menus, dropdowns, overlays, inputs, and helper/placeholder text are clearly readable with strong contrast and without relying on gradients or transparent/outlined text.
