import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
}

export function Seo({ title, description }: SeoProps) {
  useEffect(() => {
    document.title = `${title} | MANARATAK`;
    upsertMeta('description', description);
    upsertMeta('og:title', `${title} | MANARATAK`, 'property');
    upsertMeta('og:description', description, 'property');
  }, [description, title]);

  return null;
}

function upsertMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}
