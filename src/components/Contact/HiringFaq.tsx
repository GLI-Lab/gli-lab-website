import type { ReactNode } from "react";
import { IoChevronDown } from "react-icons/io5";

export type HiringFaqItem = {
  question: string;
  answer: ReactNode;
};

export default function HiringFaq({
  title,
  intro,
  outro,
  items,
}: {
  title: string;
  intro?: ReactNode;
  outro?: ReactNode;
  items: HiringFaqItem[];
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-semibold text-brand-primary text-section">{title}</h2>
      {intro}
      <div className="border-t border-gray-200">
        {items.map((item) => (
          <details
            key={item.question}
            open
            className="group border-b border-gray-200"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-3 font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
              <span>Q. {item.question}</span>
              <IoChevronDown
                size={18}
                className="mt-1 shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="pb-4 leading-relaxed text-gray-800">{item.answer}</div>
          </details>
        ))}
      </div>
      {outro}
    </section>
  );
}
