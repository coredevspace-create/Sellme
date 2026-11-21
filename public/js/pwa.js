// Rend Sellme installable (écran d'accueil, Play Store via une TWA) et utilisable hors ligne
// pour les menus. Les conversations ont toujours besoin d'internet pour joindre l'IA.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      /* sans service worker, le site marche quand même */
    });
  });
}
