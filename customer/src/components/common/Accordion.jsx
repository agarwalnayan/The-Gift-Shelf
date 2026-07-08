import { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

/**
 * Generic accordion. `items` is an array of { key, title, content }.
 * `content` can be any renderable node. Items with no content are skipped by the caller.
 */
const Accordion = ({ items, defaultOpenKey }) => {
  const [openKey, setOpenKey] = useState(defaultOpenKey ?? items?.[0]?.key ?? null);

  return (
    <div className="divide-y divide-charcoal/10 rounded-2xl border border-charcoal/10 bg-white">
      {items.map((item) => {
        const isOpen = openKey === item.key;
        return (
          <div key={item.key}>
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : item.key)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-charcoal">{item.title}</span>
              <HiChevronDown
                size={18}
                className={`shrink-0 text-charcoal/50 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`grid overflow-hidden transition-all duration-200 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="min-h-0">
                <div className="px-5 pb-5 text-sm leading-relaxed text-charcoal/70">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
