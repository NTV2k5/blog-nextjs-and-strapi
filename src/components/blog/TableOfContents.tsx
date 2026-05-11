'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ contentId }: { contentId: string }) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const container = document.getElementById(contentId);
    if (!container) return;

    const headings = container.querySelectorAll('h2, h3');
    const items: TocItem[] = Array.from(headings).map((heading, index) => {
      const text = heading.textContent || '';
      const id = heading.id || `heading-${index}`;
      if (!heading.id) heading.id = id;
      
      return {
        id,
        text,
        level: parseInt(heading.tagName[1]),
      };
    });

    setToc(items);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [contentId]);

  if (toc.length === 0) return null;

  return (
    <div className="sticky top-24 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl max-h-[calc(100vh-120px)] overflow-y-auto hidden lg:block">
      <div className="flex items-center gap-2 mb-6 text-white/50 font-bold text-xs uppercase tracking-widest">
        <List size={14} />
        On This Page
      </div>
      
      <ul className="space-y-4">
        {toc.map((item) => (
          <li 
            key={item.id} 
            style={{ paddingLeft: `${(item.level - 2) * 16}px` }}
          >
            <a 
              href={`#${item.id}`}
              className={`block text-sm transition-all duration-300 ${
                activeId === item.id 
                  ? 'text-blue-400 font-bold translate-x-2' 
                  : 'text-white/40 hover:text-white/70'
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
      
      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="text-[10px] text-white/20 uppercase font-black tracking-tighter">
          Scroll to explore
        </div>
      </div>
    </div>
  );
}
