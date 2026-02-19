/**
 * MathNode — a custom Lexical DecoratorNode that renders LaTeX
 * expressions via KaTeX.  Supports both inline and block display.
 *
 * Double-click to open the edit modal (handled by MathRenderer).
 */
import { DecoratorNode } from 'lexical';
import MathRenderer from './MathRenderer';

/* ------------------------------------------------------------------ */
/*  Lexical DecoratorNode subclass                                     */
/* ------------------------------------------------------------------ */
export class MathNode extends DecoratorNode {
  /** @type {string} */
  __latex;
  /** @type {boolean} */
  __inline;

  static getType() {
    return 'math';
  }

  static clone(node) {
    return new MathNode(node.__latex, node.__inline, node.__key);
  }

  constructor(latex = '', inline = false, key) {
    super(key);
    this.__latex = latex;
    this.__inline = inline;
  }

  /* ----- DOM ----- */

  createDOM() {
    const el = document.createElement(this.__inline ? 'span' : 'div');
    el.className = `math-node-container ${
      this.__inline ? 'math-inline-container' : 'math-block-container'
    }`;
    return el;
  }

  updateDOM() {
    // Return false — React re-render via decorate() handles updates
    return false;
  }

  /* ----- JSON serialisation (persistence) ----- */

  static importJSON(serializedNode) {
    return $createMathNode(serializedNode.latex, serializedNode.inline);
  }

  exportJSON() {
    return {
      type: 'math',
      version: 1,
      latex: this.__latex,
      inline: this.__inline,
    };
  }

  /* ----- Helpers ----- */

  getLatex() {
    return this.__latex;
  }

  setLatex(latex) {
    const writable = this.getWritable();
    writable.__latex = latex;
  }

  getInline() {
    return this.__inline;
  }

  isInline() {
    return this.__inline;
  }

  getTextContent() {
    return this.__latex;
  }

  /* ----- Decorator rendering ----- */

  decorate() {
    return (
      <MathRenderer
        latex={this.__latex}
        inline={this.__inline}
        nodeKey={this.__key}
      />
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Factory helpers                                                    */
/* ------------------------------------------------------------------ */

export function $createMathNode(latex = '', inline = false) {
  return new MathNode(latex, inline);
}

export function $isMathNode(node) {
  return node instanceof MathNode;
}
