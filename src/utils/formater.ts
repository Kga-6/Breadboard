export function formatChapterHTML(rawHTML: string): string {
  if (!rawHTML) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, 'text/html');

  const formattedParagraphs: string[] = [];

  doc.querySelectorAll('p.p').forEach((p) => {
    let formatted = '';

    p.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;

        if (el.classList.contains('v')) {
          // Verse number
          formatted += `<span class="text-gray-500 text-xs mr-1 relative pb-2 dark:text-gray-400">${el.textContent}</span>`;
        } else if (el.classList.contains('nd')) {
          // Special LORD tag
          formatted += `<span class="uppercase tracking-wide font-semibold dark:text-white">${el.textContent}</span>`;
        } else if (el.classList.contains('wj')) {
          // Jesus Words
          const cleanText = el.textContent?.replace(/^¶\s*/, '') ?? '';
          formatted += `<span class="text-red-500">${cleanText}</span>`;
        } else if (el.classList.contains('add')) {
          // Italicized additions
          formatted += `<i class="dark:text-white">${el.textContent}</i>`;
        } else {
          formatted += el.outerHTML;
        }

      } else if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent ?? '';

        // Replace all "¶" with styled span
        text = text.replace(/¶/g, `<span></span>`);
        formatted += text;
      }
    });

    formattedParagraphs.push(`<p class="leading-7 mb-4 text-[16px] text-black dark:text-white">${formatted.trim()}</p>`);
  });

  return formattedParagraphs.join('\n');
}
