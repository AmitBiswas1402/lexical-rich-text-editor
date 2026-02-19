/**
 * Toolbar — pure UI component for the formatting bar.
 * It reads format state from Zustand (set by ToolbarPlugin)
 * and dispatches Lexical commands on click.
 *
 * Table / Math insertion logic lives in separate plugins;
 * the toolbar only triggers the commands.
 */
import { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { INSERT_TABLE_COMMAND } from '../plugins/TablePlugin';
import useUIStore from '../store/uiStore';
import useEditorStore from '../store/editorStore';

export default function Toolbar() {
  const [editor] = useLexicalComposerContext();

  // Format indicators from Zustand (updated by ToolbarPlugin)
  const isBold = useUIStore((s) => s.isBold);
  const isItalic = useUIStore((s) => s.isItalic);
  const isUnderline = useUIStore((s) => s.isUnderline);
  const isStrikethrough = useUIStore((s) => s.isStrikethrough);

  const openMathModal = useUIStore((s) => s.openMathModal);
  const pageOrientation = useUIStore((s) => s.pageOrientation);
  const setPageOrientation = useUIStore((s) => s.setPageOrientation);
  const pageMargin = useUIStore((s) => s.pageMargin);
  const setPageMargin = useUIStore((s) => s.setPageMargin);

  // Save indicator
  const isDirty = useEditorStore((s) => s.isDirty);

  // Local state for the table-size popover
  const [showTableInput, setShowTableInput] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const handleInsertTable = () => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows: tableRows,
      columns: tableCols,
    });
    setShowTableInput(false);
    setTableRows(3);
    setTableCols(3);
  };

  return (
    <div className="toolbar">
      {/* ---- Text formatting ---- */}
      <div className="toolbar-group">
        <button
          type="button"
          className={`toolbar-btn ${isBold ? 'active' : ''}`}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          title="Bold (Ctrl+B)"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className={`toolbar-btn ${isItalic ? 'active' : ''}`}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          title="Italic (Ctrl+I)"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className={`toolbar-btn ${isUnderline ? 'active' : ''}`}
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
          }
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className={`toolbar-btn ${isStrikethrough ? 'active' : ''}`}
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
          }
          title="Strikethrough"
        >
          <s>S</s>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* ---- Table ---- */}
      <div className="toolbar-group" style={{ position: 'relative' }}>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => setShowTableInput((v) => !v)}
          title="Insert Table"
        >
          ⊞ Table
        </button>

        {showTableInput && (
          <div className="table-input-popover">
            <label>
              Rows
              <input
                type="number"
                min={1}
                max={20}
                value={tableRows}
                onChange={(e) => setTableRows(Number(e.target.value))}
              />
            </label>
            <label>
              Cols
              <input
                type="number"
                min={1}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(Number(e.target.value))}
              />
            </label>
            <button type="button" onClick={handleInsertTable}>
              Insert
            </button>
          </div>
        )}
      </div>

      <div className="toolbar-divider" />

      {/* ---- Math ---- */}
      <div className="toolbar-group">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => openMathModal()}
          title="Insert Math Expression"
        >
          ∑ Math
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* ---- Page orientation ---- */}
      <div className="toolbar-group">
        <button
          type="button"
          className={`toolbar-btn ${pageOrientation === 'portrait' ? 'active' : ''}`}
          onClick={() => setPageOrientation('portrait')}
          title="Portrait"
        >
          ▯ Portrait
        </button>
        <button
          type="button"
          className={`toolbar-btn ${pageOrientation === 'landscape' ? 'active' : ''}`}
          onClick={() => setPageOrientation('landscape')}
          title="Landscape"
        >
          ▭ Landscape
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* ---- Page margins ---- */}
      <div className="toolbar-group">
        <select
          className="toolbar-select"
          value={pageMargin}
          onChange={(e) => setPageMargin(e.target.value)}
          title="Page Margins"
        >
          <option value="none">No Margin</option>
          <option value="narrow">Narrow</option>
          <option value="normal">Normal</option>
          <option value="wide">Wide</option>
        </select>
      </div>

      {/* ---- Save status ---- */}
      <div className="toolbar-status">
        {isDirty ? 'Unsaved changes' : 'Saved ✓'}
      </div>
    </div>
  );
}
