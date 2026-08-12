export function initPwa(): void {
  if (typeof document === 'undefined') return;

  injectMetaTags();
  registerServiceWorker();
}

function injectMetaTags() {
  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#0a0a0f';
    document.head.appendChild(meta);
  }

  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-capable';
    meta.content = 'yes';
    document.head.appendChild(meta);
  }

  if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-status-bar-style';
    meta.content = 'black-translucent';
    document.head.appendChild(meta);
  }

  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = '/icon-192.png';
    document.head.appendChild(link);
  }

  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.info('当前浏览器不支持 Service Worker');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.info('ServiceWorker 注册成功:', registration.scope);
      })
      .catch((error) => {
        console.error('ServiceWorker 注册失败:', String(error));
      });
  });
}
