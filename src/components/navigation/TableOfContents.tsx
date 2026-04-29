import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { difficultyStore } from "../../stores/difficultyStore";

interface Heading {
  id: string;
  text: string;
  level: number;
}

const TableOfContents: React.FC = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const difficulty = useStore(difficultyStore);

  const scanHeadings = useCallback(() => {
    const article = document.querySelector('article');
    if (!article) return;

    const titleEl = document.querySelector('header h1');
    const elements = Array.from(article.querySelectorAll('h2, h3')).filter(el => !el.hasAttribute('data-toc-skip'));
    const found: Heading[] = [];

    // Add main title first
    if (titleEl && titleEl.textContent) {
      if (!titleEl.id) titleEl.id = 'page-title';
      found.push({
        id: titleEl.id,
        text: titleEl.textContent,
        level: 1,
      });
    }

    elements.forEach((el) => {
      // Skip headings that are inside hidden difficulty sections
      const parent = el.closest('.difficulty-section');
      if (parent && getComputedStyle(parent).display === 'none') return;

      // Only include headings that are actually visible
      const htmlEl = el as HTMLElement;
      if (htmlEl.offsetParent !== null || htmlEl.offsetHeight > 0) {
        const id = el.id || el.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
        if (!el.id) el.id = id;
        found.push({
          id,
          text: el.textContent || '',
          level: parseInt(el.tagName.charAt(1)),
        });
      }
    });

    setHeadings(found);
  }, []);

  // Re-scan when difficulty changes
  useEffect(() => {
    // Short delay to let the DOM update after difficulty change
    const timer = setTimeout(scanHeadings, 100);
    return () => clearTimeout(timer);
  }, [difficulty, scanHeadings]);

  // Initial scan
  useEffect(() => {
    scanHeadings();
  }, [scanHeadings]);

  // Intersection observer for active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="toc-container">
      <div className="toc-header">Inhaltsverzeichnis</div>
      <ul className="toc-list">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`toc-link ${h.level === 1 ? 'toc-title' : ''} ${h.level === 3 ? 'toc-sub' : ''} ${activeId === h.id ? 'toc-active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                setActiveId(h.id);
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
