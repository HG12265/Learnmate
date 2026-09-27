import React from 'react';

export default function ChatMarkdown({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];

  const renderInline = (text) => {
    // Split by bold (**...**) and inline code (`...`)
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} style={{ color: '#0f172a', fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} style={{
            background: '#eff6ff',
            color: '#1d4ed8',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.86em',
            fontFamily: 'Fira Code, monospace',
            border: '1px solid #bfdbfe'
          }}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      elements.push(<div key={`empty-${idx}`} style={{ height: '6px' }} />);
      return;
    }

    // Header like "**Title?**" or "### Title" or "## Title"
    if ((line.startsWith('**') && line.endsWith('**') && line.length < 80) || line.startsWith('### ') || line.startsWith('## ')) {
      const cleanTitle = line.replace(/^#{1,4}\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <div key={idx} style={{
          fontSize: '0.98rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '10px 0 6px',
          paddingBottom: '4px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>{cleanTitle}</span>
        </div>
      );
      return;
    }

    // Bullet point: "- " or "* "
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const bulletText = line.slice(2);
      elements.push(
        <div key={idx} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          margin: '5px 0',
          lineHeight: 1.55,
          color: '#334155'
        }}>
          <span style={{
            color: 'var(--primary)',
            fontSize: '1.1rem',
            lineHeight: 1.1,
            marginTop: '2px',
            flexShrink: 0
          }}>
            •
          </span>
          <div style={{ flex: 1 }}>{renderInline(bulletText)}</div>
        </div>
      );
      return;
    }

    // Numbered list item: "1. ", "2. ", etc.
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const num = numMatch[1];
      const itemText = numMatch[2];
      elements.push(
        <div key={idx} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          margin: '5px 0',
          lineHeight: 1.55,
          color: '#334155'
        }}>
          <span style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            {num}
          </span>
          <div style={{ flex: 1 }}>{renderInline(itemText)}</div>
        </div>
      );
      return;
    }

    // Standard paragraph
    elements.push(
      <p key={idx} style={{
        margin: '6px 0',
        lineHeight: 1.6,
        color: '#334155',
        fontSize: '0.9rem'
      }}>
        {renderInline(line)}
      </p>
    );
  });

  return <div>{elements}</div>;
}
