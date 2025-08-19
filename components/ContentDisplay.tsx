/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { getEnhancedSearchResult } from '../services/geminiService';

interface HyperlinkedContentProps {
  content: string;
}

const HyperlinkedContent: React.FC<HyperlinkedContentProps> = ({ content }) => {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const lines = content.split('\n');

  const handleLineClick = async (line: string, index: number) => {
    if (loadingIndex !== null) return; // Prevent multiple clicks

    const trimmedLine = line.trim();
    if (!trimmedLine) return; // Don't search for empty lines

    setLoadingIndex(index);
    try {
      const { professionalQuery, topResultUrl } = await getEnhancedSearchResult(trimmedLine);
      
      // Open the standard Google search results in the first tab
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(professionalQuery)}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');

      // If a top URL was found, open it in a second tab
      if (topResultUrl) {
        window.open(topResultUrl, '_blank', 'noopener,noreferrer');
      }

    } catch (error) {
      console.error("Failed to generate and open search link:", error);
      // Fallback for user: open the original query if AI fails
      const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmedLine)}`;
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        const isClickable = trimmedLine !== '';
        const isLoading = loadingIndex === index;
        const isProcessing = loadingIndex !== null;

        return (
          <React.Fragment key={index}>
            {isClickable ? (
              <button
                className="text-link"
                onClick={() => handleLineClick(line, index)}
                disabled={isProcessing}
                aria-label={isLoading ? "Generating search and finding top result..." : `Search Google for "${trimmedLine}"`}
                aria-busy={isLoading}
              >
                {isLoading ? 'Generating & Finding Top Result...' : line}
              </button>
            ) : (
              <span>{line}</span>
            )}
            {index < lines.length - 1 ? '\n' : ''}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default HyperlinkedContent;