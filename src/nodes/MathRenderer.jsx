/**
 * MathRenderer — React component rendered inside each MathNode's
 * decorator slot.  Renders KaTeX and opens the edit modal on
 * double-click.
 */
import { useEffect, useRef, useCallback } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import useUIStore from '../store/uiStore';

export default function MathRenderer({ latex, inline, nodeKey }) {
  const containerRef = useRef(null);
  const openMathModal = useUIStore((s) => s.openMathModal);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      katex.render(latex || '\\text{click to edit}', containerRef.current, {
        displayMode: !inline,
        throwOnError: false,
      });
    } catch {
      if (containerRef.current) {
        containerRef.current.textContent = latex || 'Invalid LaTeX';
      }
    }
  }, [latex, inline]);

  const handleDoubleClick = useCallback(
    (e) => {
      e.stopPropagation();
      openMathModal({ nodeKey, latex, inline });
    },
    [nodeKey, latex, inline, openMathModal],
  );

  return (
    <span
      ref={containerRef}
      className={`math-node ${inline ? 'math-inline' : 'math-block'}`}
      onDoubleClick={handleDoubleClick}
      title="Double-click to edit"
      role="button"
      tabIndex={-1}
    />
  );
}
