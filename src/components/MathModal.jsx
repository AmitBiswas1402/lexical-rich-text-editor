/**
 * MathModal — a simple dialog for typing / editing a LaTeX
 * expression with a live KaTeX preview.
 */
import { useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import useUIStore from '../store/uiStore';
import { INSERT_MATH_COMMAND, UPDATE_MATH_COMMAND } from '../plugins/MathPlugin';

/** Render (or clear) a KaTeX preview into the given DOM element. */
function renderPreview(el, latex, inline) {
  if (!el) return;
  if (latex.trim()) {
    try {
      katex.render(latex, el, { displayMode: !inline, throwOnError: false });
    } catch {
      el.textContent = 'Invalid LaTeX';
    }
  } else {
    el.textContent = 'Preview will appear here';
  }
}

/**
 * Wrapper that remounts the form every time the modal opens,
 * so initial state comes from props rather than useEffect + setState.
 */
export default function MathModal() {
  const showMathModal = useUIStore((s) => s.showMathModal);
  const mathEdit = useUIStore((s) => s.mathEdit);

  if (!showMathModal) return null;

  // key forces a fresh mount each time the modal opens / target changes
  const key = mathEdit ? `edit-${mathEdit.nodeKey}` : 'new';
  return <MathModalInner key={key} mathEdit={mathEdit} />;
}

function MathModalInner({ mathEdit }) {
  const [editor] = useLexicalComposerContext();
  const closeMathModal = useUIStore((s) => s.closeMathModal);

  // Derive initial values directly — no useEffect needed
  const [latex, setLatex] = useState(mathEdit?.latex ?? '');
  const [inline, setInline] = useState(mathEdit?.inline ?? false);
  // Callback ref: renders preview on mount and when latex/inline change
  const previewCallbackRef = useCallback(
    (node) => {
      renderPreview(node, latex, inline);
    },
    [latex, inline],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!latex.trim()) return;

    if (mathEdit) {
      editor.dispatchCommand(UPDATE_MATH_COMMAND, {
        nodeKey: mathEdit.nodeKey,
        latex: latex.trim(),
      });
    } else {
      editor.dispatchCommand(INSERT_MATH_COMMAND, {
        latex: latex.trim(),
        inline,
      });
    }

    closeMathModal();
  };

  return (
    <div className="modal-overlay" onClick={closeMathModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{mathEdit ? 'Edit Math Expression' : 'Insert Math Expression'}</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="latex-input">LaTeX Expression</label>
            <textarea
              id="latex-input"
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder={'e.g.  \\frac{a}{b}   or   E = mc^2'}
              rows={3}
              autoFocus
            />
          </div>

          {/* Only show inline toggle when creating (not editing) */}
          {!mathEdit && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={inline}
                  onChange={(e) => setInline(e.target.checked)}
                />
                Inline math (renders within text flow)
              </label>
            </div>
          )}

          <div className="form-group">
            <label>Preview</label>
            <div ref={previewCallbackRef} className="math-preview" />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={closeMathModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!latex.trim()}>
              {mathEdit ? 'Update' : 'Insert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
