/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, TextRun, ExternalHyperlink } from 'docx';
import HyperlinkedContent from './components/ContentDisplay';

const INITIAL_CONTENT = `Start typing here.

Every line you write will become a clickable Google search link.
To search for a single word, just put it on its own line.`;

const LOCAL_STORAGE_KEY = 'interactive-hyperlink-document-content';

const App: React.FC = () => {
  const [content, setContent] = useState<string>(() => {
    try {
      const savedContent = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (typeof savedContent === 'string') {
        return savedContent;
      }
      return INITIAL_CONTENT;
    } catch (error) {
      console.error("Could not read from localStorage", error);
      return INITIAL_CONTENT;
    }
  });
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, content);
    } catch (error) {
      console.error("Could not write to localStorage", error);
    }
  }, [content]);

  const handleDownloadDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      const lines = content.split('\n');

      const paragraphs = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
          return new Paragraph({ children: [new TextRun(line)] });
        }

        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmedLine)}`;
        
        return new Paragraph({
          children: [
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: line,
                  style: "MyHyperlinkStyle",
                }),
              ],
              link: searchUrl,
            }),
          ],
        });
      });

      const doc = new Document({
        styles: {
          characterStyles: [
            {
              id: 'MyHyperlinkStyle',
              name: 'My Hyperlink Style',
              basedOn: 'DefaultParagraphFont',
              run: {
                color: '0056b3',
                underline: {},
              },
            },
          ],
        },
        sections: [{ children: paragraphs }],
      });

      const blob = await Packer.toBlob(doc);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'interactive-document.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating DOCX file:", error);
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  return (
    <>
      <header>
        <h1>Interactive Hyperlink Document</h1>
      </header>

      <main>
        <div className="editor-container">
          <div className="editor-header">
            <h2>Editor</h2>
            <button
              className="download-btn"
              onClick={handleDownloadDocx}
              disabled={isGeneratingDocx}
            >
              {isGeneratingDocx ? 'Generating...' : 'Download Word'}
            </button>
          </div>
          <textarea
            className="editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="Document content editor"
          />
        </div>

        <div className="preview-container">
          <h2>Live Preview</h2>
          <div className="preview-content">
            <HyperlinkedContent content={content} />
          </div>
        </div>
      </main>
    </>
  );
};

export default App;
