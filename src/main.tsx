import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if (import.meta.env.PROD) {
  const umamiScript = document.createElement('script');
  umamiScript.defer = true;
  umamiScript.src = 'https://umami.elysia.cc/script.js';
  umamiScript.dataset.websiteId = '7112bf4d-0d2f-4a9c-8bba-f9522e8faf57';
  document.head.appendChild(umamiScript);

  (function(c: any, l: Document, a: string, r: string, i: string){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    const t=l.createElement(r) as HTMLScriptElement;t.async=true;t.src="https://www.clarity.ms/tag/"+i;
    const y=l.getElementsByTagName(r)[0];y!.parentNode!.insertBefore(t,y);
  })(window, document, "clarity", "script", "wtvlyscw2e");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
