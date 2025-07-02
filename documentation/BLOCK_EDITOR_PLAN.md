# Block Editor Expansion Plan

This document outlines a potential roadmap for transforming the existing `block_editor.html` demo into a polished tool for calm, efficient editing. It focuses on incremental improvements, maintainability, and seamless usage across devices.

## 1. Core Goals
- **Minimal distractions**: Keep interface simple and intuitive, with optional advanced controls.
- **Flexible block system**: Support many content types (text, image, quote, table, code, etc.) via a modular approach.
- **Live preview**: Continue real-time preview; add theme options matching the portfolio design.
- **JSON export/import**: Allow saving and loading documents for easy integration with the static site generator.
- **Keyboard accessibility**: Provide shortcuts for common actions and full keyboard navigation.

## 2. Feature Roadmap
1. **Basic Editing Enhancements**
   - Drag‑and‑drop block reordering.
   - Undo/redo history for edits.
   - Auto-save to browser storage while editing.
2. **Expanded Block Types**
   - Table block (reusing logic from `desktop/tools/table-editor.html`).
   - Code block with syntax highlighting (e.g., Prism.js, loaded locally).
   - Video embed block for local or external videos.
   - Spacer/divider block for layout control.
3. **Styling Options**
   - Theme switcher (light/dark) tied to existing global styles.
   - Per-block classes or style presets (e.g., columns, alignment).
4. **Document Management**
   - Import existing JSON to continue editing.
   - Export to JSON file or copy to clipboard.
   - Optional Markdown export for text blocks.
5. **Extensibility**
   - Simple plugin API so new block types can be registered with minimal code changes.
   - Provide hooks for validation or custom renderers.
6. **Collaboration (future)**
   - Outline how real‑time collaboration could work (e.g., using WebSocket backend).
   - Not required initially, but design code to keep state serialization clean for future expansion.

## 3. Architectural Notes
- Maintain a single `blocks` array representing document state.
- Each block should store a unique `id`, `type`, and any relevant data fields.
- Rendering functions operate purely from state, enabling easier undo/redo and import/export.
- Consider splitting code into modules (ESM) to keep logic organized: `state.js`, `ui.js`, `blocks/` directory for individual block modules.
- Keep all dependencies local to avoid network requirements during development.

## 4. Implementation Steps
1. **Refactor current demo**
   - Separate HTML, CSS, and JS files under `scripts/` and `styles/`.
   - Introduce a lightweight build process (e.g., npm scripts with esbuild) to bundle modules.
2. **Add drag‑and‑drop**
   - Use the HTML5 Drag and Drop API or a small helper library.
   - Update state order when a drag completes and rerender.
3. **Introduce new blocks**
   - Start with the table block from existing `table-editor` script, adjusting to output a compact JSON representation.
   - Implement code block rendering using `<pre><code>` and a local highlighter.
4. **Persistence**
   - Serialize `blocks` to `localStorage` after each change.
   - Provide explicit save/load buttons for exporting/importing JSON files.
5. **Polish and accessibility**
   - Add ARIA roles and labels for screen readers.
   - Implement keyboard shortcuts (e.g., add block, remove block, move block up/down).
   - Ensure focus outlines are visible in both themes.
6. **Documentation and Testing**
   - Document each block’s JSON schema in this folder.
   - Add simple unit tests (using a tiny framework like uvu) for state manipulation functions if the build environment expands to Node.

## 5. Usage Workflow
1. Open the editor and start adding blocks.
2. Arrange them via drag‑and‑drop; edit content inline.
3. Live preview updates immediately in the side panel.
4. When satisfied, export JSON and commit it under `assets/document_blocks/` for the static site.
5. The site generator consumes this JSON to create final HTML pages using templates defined elsewhere.

## 6. Future Ideas
- Inline image uploads with local resizing/compression.
- Templates for common page layouts (e.g., hero section + body + gallery).
- Mobile-friendly interface adjustments.
- Optional distraction‑free mode hiding all controls except the current block.

This plan should guide a gradual evolution from the current prototype to a production-ready block editor that matches the calm, retro aesthetic of the portfolio.
