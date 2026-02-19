/**
 * Editor — the main editor component.  Sets up LexicalComposer,
 * registers all nodes and plugins, and restores saved state from
 * localStorage on mount.
 *
 * ========  LEXICAL CORE CONCEPTS  ========
 *
 * 1. Editor Instance
 *    The object created internally by <LexicalComposer>.
 *    It owns the state, command bus, and DOM reconciliation.
 *    Plugins grab it via  useLexicalComposerContext().
 *
 * 2. Editor State
 *    An immutable snapshot — a tree of LexicalNodes + a Selection.
 *    You never mutate it directly; you call editor.update(() => { … })
 *    to produce a NEW state that Lexical reconciles to the DOM.
 *
 * 3. Updates
 *    editor.update(() => { … }) opens a writable "transaction".
 *    Inside the callback you use $ helpers ($getSelection,
 *    $createParagraphNode, etc.) to read and write nodes.
 *
 * 4. Plugins
 *    Plain React components rendered inside <LexicalComposer>.
 *    They call useLexicalComposerContext() to hook into commands,
 *    listeners, and updates — keeping behaviour modular.
 */
import { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';

import editorTheme from './theme';
import { MathNode } from '../nodes/MathNode';
import ToolbarPlugin from '../plugins/ToolbarPlugin';
import TableInsertPlugin from '../plugins/TablePlugin';
import MathPlugin from '../plugins/MathPlugin';
import PersistencePlugin from '../plugins/PersistencePlugin';
import Toolbar from '../components/Toolbar';
import MathModal from '../components/MathModal';
import { loadEditorState } from '../utils/persistence';
import useUIStore from '../store/uiStore';

function onError(error) {
  console.error('[Lexical]', error);
}

export default function Editor() {
  const [initialState, setInitialState] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted state once on mount
  useEffect(() => {
    loadEditorState().then((result) => {
      setInitialState(result.success ? result.data : null);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div className="editor-loading">Loading editor…</div>;
  }

  const initialConfig = {
    namespace: 'DocumentEditor',
    theme: editorTheme,
    onError,
    nodes: [TableNode, TableRowNode, TableCellNode, MathNode],
    ...(initialState ? { editorState: initialState } : {}),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorInner />
    </LexicalComposer>
  );
}

function EditorInner() {
  const pageMargin = useUIStore((s) => s.pageMargin);

  return (
    <div className="editor-shell">
      {/* ---- Toolbar (UI component, reads Zustand) ---- */}
      <Toolbar />

      {/* ---- Editable area ---- */}
      <div className="editor-container">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className={`editor-input margin-${pageMargin}`} />
          }
          placeholder={
            <div className={`editor-placeholder margin-${pageMargin}`}>
              Start typing your document…
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

          {/* ---- Built-in plugins ---- */}
          <HistoryPlugin />
          <TablePlugin />

          {/* ---- Custom plugins (headless, no UI) ---- */}
          <ToolbarPlugin />
          <TableInsertPlugin />
          <MathPlugin />
          <PersistencePlugin />
        </div>

        {/* ---- Modals ---- */}
        <MathModal />
      </div>
  );
}
