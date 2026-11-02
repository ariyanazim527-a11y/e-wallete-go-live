import React from 'react';
import katex from 'katex';

interface MathViewProps {
  content: string;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ content, className = '' }) => {
  // Parses text with LaTeX delimiters: $$...$$ for display equations and $...$ for inline equations
  const renderFormattedContent = () => {
    if (!content) return null;

    // Split by $$...$$ first, then by $...$
    const parts: React.ReactNode[] = [];
    const displayRegex = /\$\$([\s\S]*?)\$\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = displayRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push(renderInlineMath(textBefore, `text-${lastIndex}`));
      }

      const mathCode = match[1].trim();
      let renderedMath = '';
      try {
        renderedMath = katex.renderToString(mathCode, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        renderedMath = `<span class="font-mono text-amber-800">[${mathCode}]</span>`;
      }

      parts.push(
        <div
          key={`display-${match.index}`}
          className="my-3 overflow-x-auto py-2 text-center"
          dangerouslySetInnerHTML={{ __html: renderedMath }}
        />
      );

      lastIndex = displayRegex.lastIndex;
    }

    const remainingText = content.substring(lastIndex);
    if (remainingText) {
      parts.push(renderInlineMath(remainingText, `text-remain-${lastIndex}`));
    }

    return parts;
  };

  const renderInlineMath = (text: string, keyPrefix: string): React.ReactNode => {
    const inlineRegex = /\$([^\$\n]+?)\$/g;
    const elements: React.ReactNode[] = [];
    let lastIdx = 0;
    let inlineMatch: RegExpExecArray | null;

    while ((inlineMatch = inlineRegex.exec(text)) !== null) {
      const preText = text.substring(lastIdx, inlineMatch.index);
      if (preText) {
        elements.push(
          <span key={`${keyPrefix}-txt-${lastIdx}`} className="whitespace-pre-wrap">
            {preText}
          </span>
        );
      }

      const inlineMath = inlineMatch[1].trim();
      let rendered = '';
      try {
        rendered = katex.renderToString(inlineMath, {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        rendered = `<span class="font-mono text-amber-800">${inlineMath}</span>`;
      }

      elements.push(
        <span
          key={`${keyPrefix}-math-${inlineMatch.index}`}
          className="inline-block px-1 align-baseline font-serif"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      );

      lastIdx = inlineRegex.lastIndex;
    }

    const endText = text.substring(lastIdx);
    if (endText) {
      elements.push(
        <span key={`${keyPrefix}-end-${lastIdx}`} className="whitespace-pre-wrap">
          {endText}
        </span>
      );
    }

    return <React.Fragment key={keyPrefix}>{elements}</React.Fragment>;
  };

  return <div className={`leading-relaxed ${className}`}>{renderFormattedContent()}</div>;
};
