import { useEffect, useRef, useState } from 'react';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import './vision.css';

/**
 * The big vision: versions, partner rewards and limited brand drops.
 * The concept page is a standalone file (public/vision.html), shown here inside
 * the normal site header and footer. The frame grows to fit its content, so the
 * page scrolls like any other.
 */
export function VisionPage() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(2400);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let observer: ResizeObserver | undefined;
    const measure = () => {
      const doc = el.contentDocument;
      if (doc) setHeight(doc.documentElement.scrollHeight);
    };
    const onLoad = () => {
      observer?.disconnect();
      measure();
      const doc = el.contentDocument;
      if (doc && typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(measure);
        observer.observe(doc.body);
      }
    };
    el.addEventListener('load', onLoad);
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('load', onLoad);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main id="main" className="vision-page">
        <iframe ref={frame} src="vision.html" title="Chaotic Mischief: the big vision" className="vision-page__frame" style={{ height }} />
      </main>
      <SiteFooter />
    </>
  );
}
