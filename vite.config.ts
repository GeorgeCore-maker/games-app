import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// GitHub Pages no tiene rewrite: pedir /games-app/games devuelve 404 porque no
// existe ese fichero. Se sirve 404.html, que manda a la raiz con la ruta
// guardada en ?redirect= para que la app la recupere al arrancar.
function spaFallback(base: string): Plugin {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const html = readFileSync(resolve(dist, 'index.html'), 'utf8')
      // En un 404 no hay nada que renderizar: solo redirigir, y sin cargar el
      // bundle entero para no parpadear antes de la redireccion.
      const stripped = html.replace(/<script[\s\S]*?<\/script>/g, '')

      const script = `<script>
(function () {
  var base = ${JSON.stringify(base)};
  var l = window.location;
  var prefix = base.replace(/\\/$/, '');
  if (l.pathname !== prefix && l.pathname !== base) {
    var target = prefix + l.pathname.slice(prefix.length) + l.search + l.hash;
    l.replace(base + '?redirect=' + encodeURIComponent(target));
  }
})();
</script>`

      writeFileSync(resolve(dist, '404.html'), stripped.replace('</body>', `${script}</body>`))
    },
  }
}

// GitHub Pages sirve el proyecto en https://<usuario>.github.io/games-app/.
// Sin este base, los assets se piden en /assets/... y sale pantalla en blanco.
// Si el repo cambia de nombre, hay que cambiar esto.
export default defineConfig({
  base: '/games-app/',
  plugins: [react(), spaFallback('/games-app/')],
  server: {
    proxy: {
      '/steam-api': {
        target: 'https://store.steampowered.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam-api/, '/api'),
      },
    },
  },
})
