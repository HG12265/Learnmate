import React from 'react';

export default function MarkdownContent({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let currentCodeBlock = null;
  let codeLang = '';

  const renderFormattedText = (text) => {
    // Process bold **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} style={{ color: '#0f172a', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} style={{
            background: '#f1f5f9',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.88em',
            color: '#2563eb',
            fontFamily: 'Fira Code, monospace'
          }}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ paddingLeft: '24px', margin: '12px 0 20px', lineHeight: 1.7 }}>
          {currentList.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '8px', color: '#334155' }}>
              {renderFormattedText(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    // Check code blocks
    if (line.startsWith('```')) {
      if (currentCodeBlock !== null) {
        // End of code block
        elements.push(
          <div key={`code-${idx}`} style={{
            background: '#0f172a',
            borderRadius: '8px',
            padding: '16px 20px',
            margin: '18px 0',
            overflowX: 'auto',
            maxWidth: '100%',
            color: '#93c5fd',
            fontFamily: 'Fira Code, monospace',
            fontSize: '0.88rem',
            lineHeight: 1.55
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}><code>{currentCodeBlock.join('\n')}</code></pre>
          </div>
        );
        currentCodeBlock = null;
      } else {
        flushList();
        codeLang = line.slice(3).trim();
        currentCodeBlock = [];
      }
      return;
    }

    if (currentCodeBlock !== null) {
      currentCodeBlock.push(rawLine);
      return;
    }

    // Check headings
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={idx} style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: '24px 0 10px',
          letterSpacing: '-0.01em'
        }}>
          {renderFormattedText(line.slice(4))}
        </h3>
      );
      return;
    }

    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={idx} style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '32px 0 12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #e2e8f0',
          letterSpacing: '-0.02em'
        }}>
          {renderFormattedText(line.slice(3))}
        </h2>
      );
      return;
    }

    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={idx} style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '20px 0 14px',
          letterSpacing: '-0.02em'
        }}>
          {renderFormattedText(line.slice(2))}
        </h1>
      );
      return;
    }

    // Check unordered list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      currentList.push(line.slice(2));
      return;
    }

    // Empty lines
    if (!line) {
      flushList();
      return;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p key={idx} style={{
        fontSize: '1rem',
        lineHeight: 1.7,
        color: '#334155',
        margin: '10px 0'
      }}>
        {renderFormattedText(line)}
      </p>
    );
  });

  flushList();

  return <div style={{ color: '#1e293b', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{elements}</div>;
}
