# PagX Studio

Sitio de PagX Studio, estudio de diseño web premium: escena 3D en tiempo real, scroll cinematográfico y los conceptos del estudio en vivo dentro de un marco de navegador.

**En vivo:** https://pagxstudio.com

## Stack

Astro 7 · Three.js · GSAP + ScrollTrigger · Lenis · Tailwind CSS v4

Sitio 100 % estático, con tres niveles de animación (alto, medio y estático) y soporte para `prefers-reduced-motion`.

## Correr en local

```bash
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # salida estática en dist/
```

Requiere Node 22.12 o superior. `packages/motion` es el reloj de scroll compartido de PagX: GSAP y Lenis se mueven con un solo ticker.

## Licencia

© 2026 Esteban Muñoz · [PagX Studio](https://pagxstudio.com). Todos los derechos reservados. Ver [LICENSE](LICENSE).
