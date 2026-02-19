# 📝 Document Editor

A React-based document editor built with **Lexical**, supporting rich text, tables, and LaTeX math expressions.

## Tech Stack

| Technology | Role |
|---|---|
| **Vite** | Fast build tool & dev server with HMR |
| **React 19** | UI library (JavaScript only, no TypeScript) |
| **Lexical** | Facebook's extensible text editor framework — handles editor state, DOM reconciliation, and plugin system |
| **@lexical/table** | First-party table node support (rows, columns, header cells) |
| **@lexical/react** | React bindings for Lexical (LexicalComposer, RichTextPlugin, HistoryPlugin, etc.) |
| **Zustand** | Lightweight state management — two stores for editor content and UI state |
| **KaTeX** | Fast client-side LaTeX math rendering |
| **localStorage** | Document persistence (structured as a swappable mock API) |

## Features

- **Rich text editing** — Bold, Italic, Underline, Strikethrough with toolbar indicators and keyboard shortcuts
- **Table support** — Insert tables with configurable rows & columns from the toolbar; editable cells with header row
- **Math expressions** — Insert inline or block LaTeX math; live KaTeX preview in modal; double-click to edit existing expressions
- **Page orientation** — Toggle between Portrait (900px) and Landscape (1280px) modes
- **Page margins** — Choose from No Margin, Narrow, Normal, or Wide presets
- **Auto-save** — Debounced save to localStorage on every content change with "Saved ✓ / Unsaved changes" indicator
- **Restore on reload** — Editor state is serialized as JSON and restored from localStorage on page load
- **Undo/Redo** — Built-in history via Lexical's HistoryPlugin

## How to Run

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/AmitBiswas1402/lexical-rich-text-editor
cd lexical-rich-text-editor

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser. The editor loads immediately with hot module replacement enabled.

### Other Commands

```bash
# Production build (outputs to dist/)
npm run build

# Preview the production build locally
npm run preview

# Run ESLint
npm run lint
```

## Design Decisions

### 1. Separation of Editor Logic and UI

Lexical plugins are **headless** — they register commands and listeners but render nothing. The `Toolbar` component is a pure UI layer that reads state from Zustand and dispatches Lexical commands. This means the toolbar can be redesigned or replaced without touching any editor logic.

### 2. Two Zustand Stores

| Store | Purpose |
|---|---|
| `editorStore` | Serialized document content, save status, dirty flag |
| `uiStore` | Toolbar format indicators, modal visibility, page orientation, margins |

Splitting them prevents document-content updates from triggering toolbar re-renders and vice versa.

### 3. Custom Commands Instead of Inline Logic

Table insertion and math insertion use **custom Lexical commands** (`INSERT_TABLE_COMMAND`, `INSERT_MATH_COMMAND`, etc.) defined in their own plugin files. The toolbar dispatches these commands but never constructs Lexical nodes directly. This keeps node-creation logic testable and in one place.

### 4. MathNode as a DecoratorNode

Math expressions are implemented as a Lexical `DecoratorNode` — a node type that renders arbitrary React inside the editor. The `MathNode` stores the LaTeX string and an inline/block flag, and its `decorate()` method returns a `<MathRenderer>` component that calls KaTeX. Double-clicking a rendered expression reopens the edit modal.

`MathRenderer` lives in its own file (`nodes/MathRenderer.jsx`) to satisfy React Fast Refresh, which requires files to export only components or only non-components, not both.

### 5. Persistence as a Mock API

The `utils/persistence.js` module wraps `localStorage` behind `async` functions that return `{ success, data, error }` objects. Every caller already handles the async shape, so swapping in a real backend later requires changing only this one file.

### 6. Plugin Architecture

Each concern is a separate plugin file:

| Plugin | Responsibility |
|---|---|
| `ToolbarPlugin` | Syncs Lexical selection state → Zustand UI store |
| `TablePlugin` | Handles `INSERT_TABLE_COMMAND`, builds table node tree |
| `MathPlugin` | Handles `INSERT_MATH_COMMAND` and `UPDATE_MATH_COMMAND` |
| `PersistencePlugin` | Debounced auto-save on every content change |

All are mounted as children of `<LexicalComposer>` and grab the editor instance via `useLexicalComposerContext()`.

### 7. Page Layout Controls

Page orientation (portrait/landscape) and margin presets (none, narrow, normal, wide) are stored in Zustand and applied as CSS classes. This keeps layout purely in CSS with smooth transitions — no editor state is affected.

### 8. Placeholder Alignment

The placeholder text mirrors the active margin preset via matching CSS classes so it always appears exactly where the cursor sits, regardless of which margin is selected.

## Running

```bash
npm install
npm run dev      # Start dev server at localhost:5173
```
