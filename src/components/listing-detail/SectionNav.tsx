'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface SectionNavProps {
  sections: { id: string; label: string }[];
  title: string;
  price: string;
  /** Element whose passing reveals the bar (the listing header) */
  triggerId: string;
  headerOffset: number;
  enquireHref: string;
}

/**
 * Slim bar that docks under the site header once the listing's title has scrolled away:
 * jump links with a sliding marker, plus the title, price and an enquiry button.
 * Driven by IntersectionObservers only, never by scroll events, and always mounted: showing it
 * mid-scroll is a CSS transform, not a React mount.
 */
export function SectionNav({ sections, title, price, triggerId, headerOffset, enquireHref }: SectionNavProps) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const trigger = document.getElementById(triggerId);
    if (!trigger) return;
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < headerOffset), {
      rootMargin: `-${headerOffset}px 0px 0px 0px`,
    });
    io.observe(trigger);
    return () => io.disconnect();
  }, [triggerId, headerOffset]);

  useEffect(() => {
    const targets = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    // A section is "current" while it crosses a band just below the docked bars
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: `-${headerOffset + 90}px 0px -55% 0px` }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections, headerOffset]);

  return (
    <nav
      aria-label="Listing sections"
      aria-hidden={!visible}
      data-visible={visible || undefined}
      className="section-nav fixed inset-x-0 z-40 border-b border-navy-100 bg-white/95 shadow-[0_12px_30px_-20px_rgba(8,26,46,0.35)]"
      style={{ top: headerOffset }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <div className="hidden min-w-0 max-w-[280px] lg:block">
          <p className="truncate text-[13px] font-bold text-navy-950">{title}</p>
          <p className="text-[12px] font-extrabold text-amber-700">{price}</p>
        </div>

        <ul className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:justify-center">
          {sections.map((section) => {
            const current = visible && section.id === active;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  tabIndex={visible ? undefined : -1}
                  aria-current={current ? 'location' : undefined}
                  className={`relative block whitespace-nowrap px-3 py-4 text-[13px] font-bold transition-colors ${current ? 'text-navy-950' : 'text-navy-800/50 hover:text-navy-950'}`}
                >
                  {section.label}
                  {current && (
                    <motion.span
                      layoutId="listing-section-marker"
                      transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                      className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-amber-500"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <a
          href={enquireHref}
          tabIndex={visible ? undefined : -1}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden h-10 shrink-0 items-center gap-2 rounded-full bg-navy-950 px-4 text-[13px] font-bold text-white transition hover:bg-navy-800 md:inline-flex"
        >
          <MessageCircle className="h-4 w-4 text-amber-400" aria-hidden="true" />
          Enquire
        </a>
      </div>
    </nav>
  );
}
