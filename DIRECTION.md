# DIRECTION.md — PagX Studio

> Decisiones artísticas del sitio. Se llena en las fases F1 a F4 de `PIPELINE.md`, siguiendo `references/art-direction/README.md`.
> Los **valores** de los tokens viven en `DESIGN.md`; aquí va el **porqué**.
> Estado: aprobado por el cliente (2026-09-24). Pendiente del gate: `/impeccable critique` sobre el prototipo de F5.

## 0. Referencias
Revisadas con capturas de Playwright (desktop 1440×900, recorrido de scroll) el 2026-09-24. Se toma la idea, nunca el código ni los assets.

| Sitio | Qué hace y por qué funciona | Qué tomamos (la idea) | Qué evitamos |
|---|---|---|---|
| **ElevenLabs** (elevenlabs.io) — fuera del rubro: IA de voz | No describe el producto: lo pone a funcionar en la página. Orbes de color con grano que se tocan para escuchar una voz; un chat de agente que resuelve un reembolso delante de ti; paneles reales de la app. La UI alrededor es sobria, así que la demo es lo único que brilla. | **Demostrar en vez de describir.** Cada servicio de PagX se prueba en vivo. Demos con un gesto claro (tocar, arrastrar, hacer scroll) y respuesta inmediata. | Su estética SaaS (cards redondeadas idénticas, tabs, grises): trampa #4. Inter como display. |
| **ERA Residence** (era-residence.com) — fuera del rubro: inmobiliaria de lujo | Lujo por **ritmo y tipografía**. Loader de marca, firma caligráfica como textura, marco fino. Video a pantalla completa con control "de día / de noche", hotspots circulares, CTA dentro de un anillo. Hasta el aviso de cookies está diseñado. | **Un control que cambia el mundo** (día/noche) para la demo de glamping. **Loader como ritual.** **Diseñar lo aburrido.** La imagen manda y la UI se retira a los bordes. | Serif condensada + script. Personas en las imágenes. Etiquetas en mayúsculas espaciadas (trampa #5). |
| **Unseen Studio** (unseen.co/projects) — mismo rubro | El portafolio vive **dentro de un espacio 3D**: arcos, hojas que flotan, cards que se curvan con el scroll, aberración cromática y grano. Portal de entrada. | **El sitio es un lugar, no una página:** escenario 3D persistente detrás del DOM. **La velocidad del scroll tiene consecuencias físicas.** Un umbral de entrada. | Su paleta pastel y la mascota. Audio. Grilla de proyectos. |

**Gate F1:** ✅ dos de tres referencias están fuera del rubro.

**Patrón común:** la experiencia es el argumento; una sola cosa brilla y el resto se calla; hay un umbral de entrada; el mouse y el scroll tienen consecuencias visibles.

## 1. Tema
- **De qué trata:** un estudio de diseño web de Pereira cuyo propio sitio es la prueba de su oficio.
- **Para quién:** dueños de glampings/Airbnbs y de tiendas Shopify con un sitio feo o genérico, en Colombia y en inglés. Llegan a juzgar una sola cosa: ¿este estudio puede hacer que mi negocio se vea así?
- **Trabajo principal del sitio:** asombrar y convertir ese asombro en un WhatsApp para cotizar.
- **Vocabulario material:** obsidiana del Nevado del Ruiz (vidrio volcánico negro que, pulido, se vuelve espejo); aguas termales de Santa Rosa de Cabal (turquesa mineral, vapor, piedra mojada, noche); el oficio del rework (pulir, refinar, revelar); la pantalla como superficie de vidrio que emite luz.

## 0. Rework del 2026-09-24 (vigente; manda sobre lo que contradiga abajo)
Ver DECISIONS.md #22. Concepto: **"El trabajo habla."** Nada de 3D: el sitio es tipografía gigante y dos sitios concepto diseñados por PagX.
- **Hero (momento wow):** "Sitios que no se olvidan." a 15vw en Ysabeau de hilo (peso 200). Entra letra por letra pasando de peso 1 a 200; el cursor entinta las letras cercanas hasta 1000, y al hacer scroll todo el título engorda hacia tinta y sube. Debajo, una línea, el texto y los CTA.
- **Conceptos:** Bruma (glamping) y Cumbre (Shopify de café), cada uno con nombre gigante, marco de navegador con el diseño de escritorio (en Bruma la página se desplaza dentro del marco con el scroll; en Cumbre hay comparador antes/después) y un teléfono flotante con la versión móvil. Etiqueta visible "Concepto de PagX · marca ficticia".
- **Preguntas** y **cierre** se conservan. Manifiesto, bot, servicios y proceso salen.
- **Estático / reduced-motion:** todo visible, sin intro, sin scrub ni proximidad.

## 2. Concepto
- **Frase:** **"Enjambre."** (Reemplaza a "Obsidiana pulida" el 2026-09-24; ver DECISIONS.md #21.) Miles de partículas de luz toman la forma de lo que PagX construye: el nombre PagX, una web genérica, el domo de un glamping, una bolsa de tienda, un chat. El sitio muestra en vivo que PagX puede darle cualquier forma a tu negocio. El cursor abre un anillo de luz turquesa en el enjambre.
- **Emoción que debe dejar:** asombro y exclusividad.
- **Cómo se prueba cada decisión:** ¿esto le da forma, transforma o revela? Si no hace ninguna de las tres, sobra.

## 3. Lenguaje visual
- **Estilo principal:** #5 Dark cinematic / luxury. Negro teñido, luz escasa y dirigida, mucho espacio vacío, la UI se retira a los bordes. Encaja con la exclusividad y con la noche de las termales.
- **Estilo de apoyo:** #2 Glassmorphism CSS, reinterpretado como **vapor**: vidrio esmerilado solo en lo que flota sobre la escena (nav, controles de las demos, burbujas del bot, preguntas frecuentes). Nunca en bloques de texto largo ni en más de 3 capas visibles.
- **Material protagonista:** **enjambre de partículas** (efecto #5 de `packages/shaders`: `swarm.vert/frag`). Hasta 80.000 puntos plata con 14 % turquesa y 1,5 % brasa, mezcla aditiva. Vive en el canvas fijo y persistente y cambia de forma en cada sección.
- **Material secundario:** **vapor** (vidrio esmerilado con grano, tinte basalto, borde de luz de 1 px).
- **Todo lo demás:** sólido y silencioso (lienzo obsidiana, texto plata).

## 4. Color, tipografía y forma (el porqué; los valores van en DESIGN.md)
- **Dirección de color elegida:** **mezcla A + B** (elegida por el cliente el 2026-09-24). Neutros de Obsidiana (negro azulado, plata, humo) + acento Agua mineral de Termales de noche. El cliente descartó Cereza de café. El negro frío da exclusividad y el turquesa, que sale del territorio, da la firma. Presentación: https://claude.ai/artifact/TrXHaPJV8vaSpuHU73mzWJ
- **Dosis del acento y dónde vive:** Agua mineral ≤ 3% de pantalla, solo en lo accionable (CTA de WhatsApp, foco, selección) y como la luz que se refleja en la obsidiana. Brasa solo en el modo noche de la demo de glamping.
- **Tipografía elegida:** **Ysabeau**, una sola familia (elegida por el cliente el 2026-09-24, en la segunda ronda). El cliente rechazó las parejas de la primera ronda (Archivo, Bodoni Moda + Hanken, Anybody + Geologica) y no quiere mezclar familias; en la segunda ronda descartó Mona Sans y Bricolage Grotesque. Por qué encaja: su rango de peso va de un hilo (1) a un negro total (1000), y eso es el concepto hecho letra: la obsidiana en bruto es un hilo y pulida es tinta plena. Presentación: https://claude.ai/artifact/USP38BfNkfy9C7eWEJJUzP
- **Qué hace el titular como elemento visual:** vive en trazo fino (peso 250) y **se llena de tinta cerca del cursor** (efecto de proximidad sobre el eje de peso), con entrada letra por letra. Solo en dos titulares: el del hero y el del cierre. En el resto, los títulos entran por líneas y su peso sube con el scroll (de 250 a 500), como si se pulieran.
- **Lógica de radios (jerarquía):** lo que se toca es píldora (CTA, toggles, idioma); lo que flota es vapor con 20 px; los escenarios de las demos tienen 28 px; el texto y las listas no tienen caja. La obsidiana es facetada y filosa: el contraste entre lo pulido y lo curvo es intencional.
- **Profundidad:** no hay sombras grises. La profundidad sale de la luz: la obsidiana refleja, el vapor desenfoca lo que está detrás y hay un grano global muy sutil (2–3%) que une el 3D con el DOM.
- **Carácter del motion:** lento al entrar y firme al llegar (expo-out). Un easing principal para todo. Ritmo: una respiración larga por sección, nunca ráfagas.

## 5. Momento wow — "El enjambre" (vigente desde 2026-09-24)
- **Qué es:** al entrar, el loader engorda "PagX" de hilo a tinta con el progreso real y la letra viaja a la cabecera. Mientras tanto, una nube de partículas dispersa por toda la pantalla converge en 2,4 s y forma el nombre **PagX** en grande (arriba a la derecha, contorno más denso para que se lea nítido), y el titular entra letra por letra. El cursor abre un anillo de luz turquesa que aparta y arremolina las partículas; su velocidad las arrastra. Al bajar, el enjambre se transforma: orbe con anillo → web genérica de plantilla ("Si se ve genérico…") → PagX → orbe → domo geodésico (glamping) → bolsa de compras (Shopify) → burbuja de chat (bot) → orbe tenue (servicios) → web genérica (proceso) → orbe (preguntas) → PagX (cierre). Scroll rápido suelta el enjambre y el hover en servicios lo agita.
- **Tier medio:** 30.000 partículas (16.000 en móvil), DPR 1,5.
- **Tier estático (y reduced-motion):** imagen `swarm-static.webp` del nombre en partículas, sin canvas.
- **Móvil:** 36.000 partículas en alto; fuera del logo, el enjambre baja a 45 % de opacidad porque queda bajo los titulares. Sin interacción de cursor.

### (Histórico) Momento wow anterior — "El pulido"
- **Qué era:** al entrar, la pantalla está negra y el nombre PagX aparece en trazo de hilo. Mientras cargan los assets, el progreso real engorda la letra de hilo a tinta. Al terminar, la letra se afina y sube a la cabecera, y en el centro emerge la obsidiana **en bruto** (opaca, rugosa, envuelta en vapor). En 1,6 s el vapor se retira y la piedra **se pule** delante del visitante: la rugosidad baja a cero, aparece el reflejo mineral y el titular "Sitios que no se olvidan" entra letra por letra. Desde ese momento, el cursor es una luz que se refleja en la piedra y entinta la letra que toca.
- **Dónde ocurre:** loader → hero (progreso 0,00). La obsidiana sigue en el canvas persistente durante todo el sitio y cambia de papel en cada sección (ver storyboard).
- **Tier medio:** la misma coreografía con material matcap horneado (sin transmisión ni reflejos en tiempo real), DPR 1,5 y vapor en CSS en vez de shader.
- **Tier estático (y reduced-motion):** imagen AVIF de la obsidiana pulida con un fundido de 400 ms, titular a peso fijo 300 sin efecto de proximidad y loader reducido al nombre, sin animación de peso.

## 6. Fichas por elemento

### Loader
- **Forma:** pantalla completa negra; "PagX" centrado en Ysabeau a tamaño display.
- **Material:** sólido (lienzo obsidiana). Sin vidrio.
- **Estados:** cargando (el peso sigue el progreso real, de 1 a 1000) / listo (la letra baja a 250 y viaja a la cabecera) / error de 3D (salta al tier estático sin avisar).
- **Motion:** tiempo de reloj ligado al progreso de assets; salida de 1,1 s con easing principal. Si a los 2,5 s no terminó, el sitio arranca en tier medio y se actualiza en silencio.
- **Cursor:** nativo.
- **Tiers:** alta y media, igual; estática, sin animación de peso (fundido corto).
- **Móvil:** igual, con la palabra a 30vw.
- **Accesibilidad:** `aria-busy` en el main; el titular del hero ya está en el DOM (el LCP es texto). Nunca bloquea más de 2,5 s.

### Transiciones de página
- **Forma:** el sitio es de una página por idioma (`/` y `/en`) más la 404. Cambiar de idioma hace un fundido de 600 ms del DOM mientras el canvas persiste (`transition:persist`) y la obsidiana gira media vuelta.
- **Material:** sólido. **Estados:** no aplica. **Motion:** View Transitions de Astro, easing principal. **Cursor:** nativo.
- **Tiers:** alta y media con giro; estática con fundido. **Móvil:** igual.
- **Accesibilidad:** el foco vuelve al inicio del main; `lang` cambia.

### Fondo / atmósfera
- **Forma:** lienzo obsidiana plano; detrás, el canvas fijo con la obsidiana y una bruma de vapor muy baja que se mueve lento.
- **Material:** sólido + luz. Grano global al 2–3%.
- **Estados:** cambia de temperatura solo en la demo de glamping de noche (sube la brasa).
- **Motion:** reloj (bruma, `uTime`) y scroll (posición de la piedra).
- **Cursor:** la luz del cursor ilumina la bruma a su alrededor.
- **Tiers:** alta: bruma con shader de ruido; media: gradiente CSS animado; estática: gradiente fijo.
- **Móvil:** sin bruma animada; gradiente fijo + obsidiana.
- **Accesibilidad:** el fondo nunca baja el contraste del texto de 7:1.

### Scroll
- **Forma:** Lenis con suavizado moderado (`lerp` 0,1). Secciones fijadas (pin): manifiesto y demo de glamping. Sin parallax decorativo.
- **Motion:** ScrollTrigger es el dueño del progreso 0→1 de cada sección.
- **Tiers:** alta y media con Lenis; estática con scroll nativo.
- **Móvil:** scroll nativo (Lenis desactivado en táctil), pines más cortos.
- **Accesibilidad:** nunca se secuestra; con reduced-motion no hay pines animados, solo el estado final.

### Cursor
- **Forma:** cursor nativo visible + un **punto de luz mineral** difuso (unos 280 px, 10% de opacidad) que lo sigue con damping. Es la luz que pule.
- **Material:** luz.
- **Estados:** sobre la obsidiana la ilumina con un reflejo; sobre titulares con efecto entinta la letra; sobre CTA el punto se contrae y el botón atrae magnéticamente (máx. 8 px); arrastrando (antes/después) se vuelve una barra vertical.
- **Motion:** interacción (maath damp, 0,15).
- **Tiers:** alta y media, igual; estática, sin seguidor.
- **Móvil:** no existe; el toque genera un destello breve en el punto tocado.
- **Accesibilidad:** el cursor nativo nunca se oculta.

### Selección, scrollbar y foco
- **Selección:** fondo agua mineral, texto obsidiana.
- **Scrollbar:** fina, riel basalto, pulgar humo.
- **Foco:** anillo de 2 px agua mineral con 3 px de separación, en todo lo interactivo, siguiendo el radio del elemento.
- **Accesibilidad:** foco siempre visible con teclado (`:focus-visible`).

### Header / nav
- **Forma:** desktop: logotipo a la izquierda; a la derecha, Demos, Servicios, Proceso, Preguntas, selector ES/EN y el CTA "Cotizar" en píldora. Alto 72 px. Se esconde al bajar y reaparece al subir.
- **Material:** transparente sobre el hero; al hacer scroll se vuelve **vapor** (esmerilado, tinte basalto 55%, borde de luz de 1 px).
- **Estados:** enlace activo con una línea de 1 px bajo el texto y peso 600; hover sube el peso de 440 a 600 (la letra se entinta); foco con anillo.
- **Motion:** scroll para mostrar y ocultar (0,45 s); interacción para el peso (0,3 s).
- **Cursor:** nativo + luz.
- **Tiers:** alta y media con `backdrop-filter`; estática con fondo basalto al 92% sin blur.
- **Móvil:** barra inferior al alcance del pulgar con el CTA "Cotizar por WhatsApp" a todo el ancho y un botón de menú; arriba queda solo el logotipo.
- **Accesibilidad:** `nav` con `aria-label`; `aria-current` en la sección activa; salto al contenido.

### Menú (móvil)
- **Forma:** pantalla completa de vapor que sube desde la barra inferior; ítems en Ysabeau a 3rem.
- **Material:** vapor.
- **Estados:** abierto / cerrado; cada ítem entra con escalonado de 40 ms y su peso sube de 200 a 500.
- **Motion:** interacción, 0,6 s, easing principal.
- **Tiers:** estática sin blur y sin escalonado.
- **Accesibilidad:** trampa de foco, cierre con Escape y con el mismo botón, `aria-expanded`.

### Enlaces en texto
- **Forma:** subrayado de 1 px en humo; al hover, el subrayado se vuelve agua mineral y la palabra sube de peso.
- **Motion:** interacción, 0,3 s. Sin "→".
- **Accesibilidad:** el subrayado nunca desaparece (no depende solo del color).

### Hero
- **Forma:** titular "Sitios que no se olvidan." / "Websites no one forgets." abajo a la izquierda, en 2–3 líneas a tamaño display; la obsidiana a la derecha, ocupando unos 45% del ancho; debajo del titular, una línea de texto y el CTA. Nada centrado.
- **Material:** obsidiana (protagonista) + texto sólido.
- **Estados:** ver momento wow.
- **Motion:** orquestado (salida del loader) + interacción (proximidad en el titular, inclinación de la piedra con el mouse, máx. 6°).
- **Cursor:** luz que entinta y refleja.
- **Tiers:** ver momento wow.
- **Móvil:** la obsidiana arriba (40% del alto), reencuadrada y más chica; el titular debajo a 3,1rem y peso 400 (el hilo no aguanta en pantallas chicas); la piedra gira sola muy lento en vez de seguir al mouse.
- **Accesibilidad:** `h1` real; la piedra es decorativa (`aria-hidden`).

### Tipografía
- **Forma:** Ysabeau en todo el sitio. Display en peso 250, títulos de sección 300→500 con el scroll, texto 440, botones 650. Escala fluida con `clamp()` (DESIGN.md). Largo de línea máximo 64 caracteres.
- **Motion:** titulares de sección por líneas (SplitText, máscara desde abajo, 0,9 s, escalonado de 80 ms); por letras solo en hero y cierre.
- **Móvil:** display con piso de peso 400.
- **Accesibilidad:** nunca por debajo de peso 350 en texto de lectura; contraste ≥ 7:1.

### Botones / CTA
- **Forma:** jerarquía de 3: **primario** (píldora agua mineral con texto obsidiana: "Cotizar por WhatsApp"), **secundario** (píldora con borde humo: "Ver demos") y **terciario** (enlace de texto).
- **Material:** sólido; el primario es la única superficie de color del sitio.
- **Estados:** reposo; hover (atracción magnética de 8 px, el relleno se ilumina hacia el cursor); focus (anillo); active (escala 0,97); disabled (no se usa en el primario); loading (no aplica, abre WhatsApp directo).
- **Motion:** interacción, springs de Motion (rigidez media, sin rebote visible).
- **Cursor:** el punto de luz se contrae dentro del botón.
- **Tiers:** estática sin magnetismo.
- **Móvil:** alto mínimo de 52 px, a todo el ancho en la barra inferior.
- **Accesibilidad:** es un enlace (`a`) a `https://wa.me/573136682674` con texto explícito; el número también aparece como texto seleccionable en el cierre.

### Cards
- **Decisión:** **no hay cards.** Servicios es una lista, el proceso es una línea de tiempo y las demos son escenarios. Evita la trampa #4.

### Imágenes y video
- **Decisión:** casi no hay fotos. Todo lo visual sale de la escena 3D y de las demos. La imagen OG y el fallback estático son renders propios de la obsidiana. **Ningún rostro humano en ningún asset.**

### Galería / portafolio
- **Decisión:** no existe. El cliente decidió no mostrar proyectos; las demos en vivo los reemplazan.

### Escena 3D (la obsidiana)
- **Forma:** una piedra de obsidiana facetada (unos 40 facetas grandes y filos vivos), flotando. Modelada en Blender, con keyframes para cada papel.
- **Material:** vidrio volcánico negro: `MeshPhysicalMaterial` con `roughness` animable (1 en bruto, 0,05 pulida), `clearcoat` y un mapa de entorno con luz mineral y un toque de brasa.
- **Papeles por sección:** hero (se pule); manifiesto (la cámara se acerca y la cara refleja las líneas de texto); glamping (baja y se vuelve el piso de la escena: una laguna negra que refleja el domo); Shopify (se retira al fondo); servicios (refleja el servicio en hover); cierre (vuelve al centro, pulida por completo).
- **Motion:** scroll para la posición (`mixer.setTime(progress * duration)`); reloj para la rotación lenta; interacción para la inclinación.
- **Tiers:** alta: material físico + entorno en tiempo real; media: matcap horneado; estática: AVIF.
- **Móvil:** geometría más simple (unas 20 facetas), DPR 1,5 como máximo.
- **Accesibilidad:** decorativa.

### Manifiesto (sección nueva)
- **Forma:** tres líneas grandes, una por pantalla, fijadas (pin): "Tu sitio es la primera visita a tu negocio." / "Si se ve genérico, tu negocio también." / "Nosotros lo pulimos." El texto real se escribe y se aprueba con el cliente.
- **Material:** texto sólido sobre la obsidiana cercana.
- **Motion:** scroll: el peso de cada línea sube de 200 a 700 mientras cruza el centro de la pantalla.
- **Tiers:** estática con peso fijo 500 y sin pin.
- **Móvil:** líneas a 2,4rem, pin más corto.
- **Accesibilidad:** texto real en el DOM, en orden.

### Demo 1 · Glamping ("De día / de noche")
- **Forma:** escenario a pantalla completa con esquinas de 28 px: un domo de glamping en la niebla sobre una laguna negra (la obsidiana hecha agua). Arriba, un control de vapor "De día / De noche" (idea de ERA). Abajo, una etiqueta visible: "Concepto de PagX para un glamping".
- **Material:** escena 3D (secundaria a la obsidiana) + control de vapor.
- **Estados:** día (luz fría, niebla clara) / noche (cielo profundo, la brasa se enciende dentro del domo y se refleja en la laguna) / transición de 1,6 s entre ambos.
- **Motion:** scroll mueve la cámara alrededor del domo (pin de 150vh); interacción cambia día/noche.
- **Cursor:** la luz del cursor mueve la niebla.
- **Tiers:** alta: escena completa con niebla volumétrica; media: niebla en planos; estática: dos imágenes AVIF (día y noche) con fundido.
- **Móvil:** cámara fija de frente; el toggle queda grande al alcance del pulgar; sin pin.
- **Accesibilidad:** el toggle es un `button` con `aria-pressed`; la etiqueta de concepto se lee.

### Demo 2 · Rework de tienda ("Antes / después")
- **Forma:** un marco de navegador de 28 px con dos versiones de la misma tienda de café del Eje Cafetero (marca ficticia): a la izquierda la versión genérica de plantilla, gris y plana; a la derecha la versión PagX, con el empaque del café girando en 3D. Una barra vertical se arrastra para comparar. Etiqueta: "Concepto de PagX para una tienda Shopify".
- **Material:** sólido; el producto 3D usa luz de estudio, no obsidiana.
- **Estados:** reposo (la barra hace un pequeño vaivén para invitar a arrastrar); arrastrando; soltado.
- **Motion:** interacción (drag con inercia de maath).
- **Cursor:** se vuelve una barra vertical sobre el marco.
- **Tiers:** alta: producto en 3D; media: secuencia de 24 frames; estática: dos imágenes.
- **Móvil:** la barra se arrastra con el pulgar; el marco pasa a formato de teléfono (se muestra la tienda móvil, que es lo que ve su cliente).
- **Accesibilidad:** la barra es un `input type="range"` con etiqueta; también funciona con flechas del teclado.

### Demo 3 · Automatización ("El bot que atiende")
- **Forma:** una conversación de WhatsApp que se escribe sola: un huésped pregunta por disponibilidad para el sábado y el bot responde, ofrece dos fechas y confirma la reserva. A la derecha, 3 frases cortas de qué automatizamos (tiendas, atención, reservas). Etiqueta: "Concepto de PagX".
- **Material:** burbujas de vapor; las del bot con borde de luz mineral.
- **Estados:** en espera; escribiendo (tres puntos que respiran); mensaje entregado; conversación terminada con botón "Ver otra vez".
- **Motion:** scroll dispara el inicio (una sola vez); reloj para el ritmo de la conversación.
- **Tiers:** estática muestra la conversación completa.
- **Móvil:** la conversación ocupa todo el ancho, como en un teléfono de verdad.
- **Accesibilidad:** `aria-live="polite"`; con reduced-motion, la conversación aparece completa.

### Servicios
- **Forma:** lista de 3 filas grandes, no cards: "Sitios web a medida", "Rework de tiendas Shopify" y "Automatizaciones". Cada fila tiene título en display, una frase y "Se cotiza por WhatsApp".
- **Material:** texto sólido y líneas de 1 px en ceniza.
- **Estados:** hover: el título se entinta (de 300 a 600) y la obsidiana, al fondo, gira para reflejar un símbolo del servicio.
- **Motion:** interacción, 0,45 s.
- **Tiers:** estática sin reflejo.
- **Móvil:** filas que se expanden al tocar (acordeón).
- **Accesibilidad:** `h3` por servicio; el acordeón móvil con `aria-expanded`.

### Proceso
- **Forma:** línea de tiempo vertical de 4 pasos (es una secuencia real, por eso lleva números): 1 Conversación por WhatsApp; 2 Propuesta con fechas cerradas; 3 Diseño y construcción (de 10 a 25 días según el plan); 4 Entrega y primer mes de mantenimiento incluido.
- **Material:** sólido; la línea se llena de agua mineral con el scroll.
- **Motion:** scroll (el llenado de la línea); los números pasan de hilo a tinta al activarse.
- **Tiers:** estática con la línea llena.
- **Móvil:** igual, más compacto.
- **Accesibilidad:** lista ordenada (`ol`).

### Preguntas frecuentes
- **Forma:** acordeón de 5 a 7 preguntas en una columna angosta. El contenido se escribe con el cliente.
- **Material:** vapor al abrir cada respuesta.
- **Estados:** cerrada / abierta / foco.
- **Motion:** interacción, altura animada 0,45 s.
- **Accesibilidad:** `details/summary` o botón con `aria-expanded`.

### Cierre + formulario de contacto
- **Decisión:** no hay formulario; el contacto es WhatsApp directo (acción principal) e Instagram.
- **Forma:** titular grande "Hablemos de tu sitio." con el efecto de proximidad; debajo, el CTA primario y el número visible como texto seleccionable con botón "Copiar número"; la obsidiana vuelve al centro, pulida por completo.
- **Estados:** "Copiar número" pasa a "Número copiado" durante 2 s.
- **Tiers y móvil:** como el hero.

### Footer
- **Forma:** una línea: logotipo, Instagram, ES/EN y un detalle de autor que se calcula en vivo: "Pereira, Colombia · 21:14", con la hora real de Pereira. Si allá es de noche, la obsidiana se ve un poco más oscura.
- **Accesibilidad:** `footer` con enlaces reales.

### 404
- **Forma:** la obsidiana aparece rajada, con el texto "Esta página no existe." y un enlace "Volver al inicio".
- **Tiers:** estática con imagen.

### Metadatos
- **Favicon:** una faceta de obsidiana en negro sobre agua mineral.
- **Imagen OG:** render de la obsidiana pulida con el titular en Ysabeau (diseñada, no captura).
- **`theme-color`:** #090A0E.

## 7. Storyboard del scroll (0 → 1)
| Progreso | Sección | DOM | 3D / shaders | Cámara |
|---|---|---|---|---|
| 0,00 | Loader → Hero | "PagX" de hilo a tinta; titular letra por letra; CTA | Obsidiana en bruto → pulida (rugosidad 1 → 0,05); el vapor se retira | Frontal, piedra a la derecha |
| 0,00–0,12 | Hero | Titular con proximidad | La piedra sigue al mouse (máx. 6°) | Estática |
| 0,12–0,24 | Manifiesto (pin) | 3 líneas, peso 200 → 700 al cruzar el centro | La piedra crece y refleja las líneas | Push-in lento hacia una faceta |
| 0,24–0,42 | Demo glamping (pin 150vh) | Toggle día/noche, etiqueta de concepto | Transición por disolución con ruido (vapor, efecto #4); la piedra baja y se vuelve la laguna | Órbita de 90° alrededor del domo |
| 0,42–0,56 | Demo Shopify | Marco antes/después | La piedra se retira al fondo; el producto gira en el marco | Estática |
| 0,56–0,68 | Demo bot | Conversación que se escribe sola | La sección tapa a la anterior (sube sobre ella) | — |
| 0,68–0,80 | Servicios | Lista de 3 filas | La piedra refleja el servicio en hover | Lateral, piedra al fondo a la derecha |
| 0,80–0,90 | Proceso | Línea que se llena | La piedra gira un cuarto de vuelta | — |
| 0,90–0,95 | Preguntas | Acordeón | Quieta | — |
| 0,95–1,00 | Cierre + footer | "Hablemos de tu sitio." con proximidad; CTA; hora de Pereira | La piedra vuelve al centro, pulida por completo | Frontal, igual que al inicio (cierre en círculo) |

**Variedad de entradas:** push-in → disolución de vapor → corte → sección que tapa → fila por fila → llenado de línea → acordeón → regreso al inicio. Ninguna sección entra igual que la anterior.

## 8. Revisión anti-genérico
1. **Crema + serif + terracota:** no aparece.
2. **Negro + un único acento vivo:** **riesgo real** (el cliente pidió negro y eligió turquesa). Mitigación: negros teñidos de azul, el turquesa solo en lo accionable y en ≤ 3%, y el protagonista es un material con luz y reflejos, no un color. La brasa agrega una segunda temperatura dentro de la demo.
3. **Layout de periódico:** no; hay radios con jerarquía y composición libre.
4. **Kit de cards SaaS:** eliminado; no hay cards.
5. **Chrome de plantilla:** sin eyebrows en mayúsculas, sin "·" en metadatos (salvo la línea de lugar y hora del footer, que es un dato real), sin "→" en botones y sin monospace.
6. **Gradiente morado con hero centrado:** no; el hero es asimétrico.
7. **Resaltar una palabra del titular:** en reposo, el titular tiene un peso uniforme. El entintado solo pasa donde está el cursor del visitante, así que es interacción, no un resaltado fijo.

**Pendiente del gate:** `/impeccable critique` se corre sobre el prototipo de F5, porque todavía no hay interfaz renderizada que criticar.

## 9. Presupuesto
- **Obsidiana:** GLB < 400 KB (Meshopt), entorno HDR < 300 KB (KTX2).
- **Escena glamping:** < 2 MB, carga diferida al acercarse a la sección.
- **Producto de la tienda:** < 1,2 MB, carga diferida.
- **Secuencias de frames:** solo el tier medio de la demo Shopify: 24 frames WebP (desktop) y 16 (móvil).
- **Fuentes:** 1 archivo, Ysabeau variable redonda (sin cursiva), WOFF2 con subset latino, unos 60–90 KB. Precargado porque es el LCP.

## 10. Portafolio — "Bajo la seda" (2026-10-08, ver DECISIONS.md #30)
Página aparte (`/portafolio/`, `/en/portfolio/`). La seda negra de la home es una superficie líquida; entrar al portafolio es **hundirse en ella**. Abajo, en la oscuridad del metal líquido, flotan los proyectos como láminas de vidrio que una "visión de máquina" turquesa escanea. Referencias del cliente (Pinterest): metal líquido cromado, recuadros de rastreo sobre una flor pixelada y la pila de sitios en perspectiva de LE:MA. Se recrea la idea, no se copia.

- **Prueba del concepto:** revela (lo que hay bajo la superficie del estudio es su trabajo).
- **Material:** todo lo 3D sale de Blender (`assets/blender/portafolio.blend`, copia de `silk.blend`): superficie, cámara, láminas, luz y partículas, renderizado en Cycles. La web solo reproduce los cuadros con el scroll y pone encima HTML vivo.

### Fichas
- **Entrada (home → portafolio):** "Portafolio" en el nav. Al hacer click, la seda en vivo de la home se hunde bajo el cursor (presión + ondas del shader existente), la pantalla funde a negro en 0,6 s y se navega. Con reduced-motion se navega directo.
- **Superficie (cuadro 0):** el mismo encuadre y la misma luz de la seda de la home, para que no se note el corte. Es el póster (LCP). Título "Bajo la superficie." en Ysabeau de hilo, con la pista "Desliza para sumergirte".
- **Descenso:** se reproduce solo como una película (DECISIONS #31): la caída corre hasta Bruma, se detiene, y "Siguiente" (o rueda, swipe, flechas) avanza al próximo capítulo. Nada está ligado al scroll. La superficie hace un hoyuelo, la cámara la atraviesa y queda bajo la tela: cáusticas turquesa y plata que bajan desde arriba, partículas suspendidas.
- **Láminas (0,33–0,92):** Bruma y luego Cumbre. Losas de vidrio negro con el sitio de escritorio encendido como pantalla, levemente inclinadas, cada una con su propia luz. La cámara frena frente a cada una para que se pueda leer.
- **HUD de escaneo:** corchetes turquesa en las 4 esquinas de la lámina (posición exacta exportada desde Blender por cuadro), etiqueta `BRUMA · glamping`, coordenadas y un `conf.` que sube mientras la cámara se acerca. Hover/foco: lock-on (los corchetes se cierran sobre la lámina y aparece "Entrar al sitio"). Click/Enter abre el concepto en vivo.
- **Salida (0,92–1):** el fondo se ilumina desde abajo; "¿El tuyo es el siguiente?" + CTA de WhatsApp (botón principal reflejo de seda).
- **Cursor:** el del sistema; el lock-on es la respuesta.
- **Tiers:** alta = secuencia de escritorio completa (1920 px); media (móvil o `hardwareConcurrency` ≤ 4) = perfil vertical de 900×1600; estática (reduced-motion o `saveData`) = tres cuadros clave como imágenes normales con el mismo contenido y enlaces.
- **Móvil:** cámara vertical propia en Blender (no se recorta la de escritorio). El HUD se simplifica a corchetes + nombre; el enlace va debajo de la lámina.
- **Accesibilidad:** el canvas es decorativo (`aria-hidden`); cada proyecto es un `<a>` real con su nombre y descripción; el orden de foco sigue el descenso.
- **Presupuesto:** ~240 cuadros WebP por perfil (≈ 19 MB escritorio, ≈ 10 MB móvil), carga progresiva: primero la caída, luego intercalado. El póster < 200 KB.

### Ronda 2 (2026-10-08): más creativo y más color
El cliente aprobó la idea, pero pidió algo "más creativo y llamativo, con colores más llamativos". Cambios:
- **Seda tornasol:** al hundirse, la seda negra se vuelve cromo iridiscente (película delgada: magenta, cian y oro). El cuadro 0 sigue igual a la home.
- **Nacen del metal líquido (nuevo momento wow):** cada lámina llega como una ola de cromo líquido iridiscente; un haz de escaneo turquesa la recorre de arriba abajo, el líquido se solidifica a su paso y revela el sitio.
- **Un mundo de color por proyecto:** la niebla cambia con la profundidad: turquesa bajo la superficie → azul eléctrico con luz ámbar (Bruma) → cobre y magenta (Cumbre) → violeta en el fondo.
- **Gotas de cromo** suspendidas en vez de partículas de luz.

## 11. Rework "Horizonte" (2026-10-09, ver DECISIONS.md #33; manda sobre §2–§8)

**Pedido del cliente:** rehacer PagX "muy premium y tecnológica", cambiando colores, animaciones y todo, combinando la identidad de 4 pines de Pinterest y con muchas animaciones 3D, una por cada tramo. La estructura y el orden de servicios se mantienen: hero, Conceptos (Bruma, Cumbre), Automatizaciones, cierre.

**Concepto:** PagX es el punto donde el código se vuelve sitio. Bajar por la página es cruzar un horizonte y ver qué hay del otro lado.

| Sección | Acto 3D (`src/scripts/stage.ts`) | Pin de origen | Interacción |
|---|---|---|---|
| Hero | **Horizonte**: unos 22.000 glifos de terminal (Share Tech Mono, atlas 8×4) caen en espiral por un embudo hacia un agujero negro, con disco de acreción ember/rojo y anillo de fotones | CODING (agujero de código) | El cursor mueve la cámara. En la segunda mitad del scroll del hero la cámara cae dentro del agujero |
| Conceptos | **Escaneo**: nube de unos 42.000 puntos con líneas de barrido verticales y un escáner que sube y baja. Recuadros de visión de máquina (DOM) se fijan a puntos reales, y uno de cada cinco es rojo | Vega (flor + tracking) | La nube cambia de cuerpo según el caso visible: flor (sección), cordillera en curvas de nivel (Bruma) y grano de café (Cumbre) |
| Automatizaciones | **Flujo**: 6 cintas de luz índigo, violeta y hielo que se tuercen, con paquetes de datos que las recorren | Landing "A new way to think" (cintas) | Al reproducir un caso, los paquetes aceleran. Los paneles de vidrio difuminan las cintas |
| Cierre | **Señal**: horizonte de un planeta con retícula, borde blanco, atmósfera azul y banda roja, más una órbita de polvo | Póster de agencia negro/azul/rojo | El planeta sube al llegar y el cursor da parallax |

**Interfaz:** tipografía Archivo expandida (125 %, 820) en mayúsculas para display y nombres de casos. Share Tech Mono para el HUD: eyebrows `[01]`, columnas de specs con hechos de PRODUCT.md (10–25 días, 1 mes de mantenimiento, a medida), coordenadas de Pereira y etiquetas de tracking. Detrás de todo va una rejilla fina de 6 columnas.

**Intro (momento wow):** el título sube letra por letra y se decodifica desde glifos de terminal mientras el agujero negro aparece detrás. Cerca del cursor, las letras se adelgazan hasta un peso de alambre.

**Técnica:** three.js 0.186 con un solo canvas fijo y un solo renderer en el reloj maestro. Cada acto tiene su escena y su cámara y solo se renderiza mientras su sección está en pantalla; los actos son aditivos, así que los fundidos entre secciones no cuestan nada. three.js se carga con `import()` cuando el navegador está libre, y el póster (`public/home/horizon.webp`) cubre el primer pintado.

**Tiers:**
- Alta: DPR ≤ 1,75 y todas las partículas.
- Media (puntero grueso o ≤ 4 núcleos): DPR 1 y alrededor de un tercio de las partículas.
- Estática (`prefers-reduced-motion`): sin WebGL; cada sección muestra un fotograma de su acto (`public/home/{horizon,scan,flow,signal}[-m].webp`, generados con `qa/posters.mjs`).
- Sin WebGL: queda el póster fijo.

**Móvil:**
- El agujero negro sube al tercio superior, las specs del hero se ocultan y el display baja a 11vw para que ninguna palabra se corte.
- La nube y el planeta se reencuadran con un FOV más abierto.

### 11.1 Ronda 2 (2026-10-09, DECISIONS #34; manda sobre la tabla de §11)
| Sección | Ahora |
|---|---|
| Hero | Cintas de código (pin Imagica): unos 47.000 glifos en 5 cintas paramétricas que fluyen y se tuercen. Los bordes y pliegues concentran glifos y luz (violeta → azul, con destellos naranjas en el borde). En oscuro es luz aditiva; en claro, tinta índigo sobre papel. |
| Conceptos | La nube escaneada vive **dentro del titular**, en una ventana oscura: flor en "Así podría [▣] verse tu negocio", cordillera junto a "Bruma" y grano junto a "Cumbre". Se arma desde polvo la primera vez que aparece. Los recuadros de tracking saltan de la ventana al sitio en vivo mientras el caso cruza la pantalla. |
| Automatizaciones | Sin fondo 3D. Lista con subrayado azul→rojo, línea de 1px que se dibuja, paquete con estela y nodos que se encienden en tinta. Burbuja del cliente en azul. |
| Cierre | El horizonte del planeta hace de banda del pin GIRLBOSS (borde blanco, azul y rojo) bajo el título, con "sitio." en degradado. |

**Interfaz (anti "look AI"):**
- Grotesca neutra (Hanken Grotesk 600 en display, con tracking cerrado).
- Labels de 11–12 px en mayúsculas y pastillas planas tinta/papel.
- Hairlines y la rejilla de 6 columnas.
- Nada de glows de neón, chips de color ni mono decorativa.
- Los marcos de los sitios reciben una luz azul y roja desde abajo, como la modelo del pin.

### 11.2 Ronda 3 (2026-10-09, DECISIONS #35; manda sobre §11 y §11.1)
**Historia única:** el código del hero se vuelve cosas.
1. **Hero:** cintas de código (sin cambios, con colores más vivos en claro).
2. **Conceptos:** el código cae y arma un laptop y un teléfono. Giran, aterrizan sobre el marco real y el sitio en vivo aparece. El marco aterriza cuando su borde superior llega a un cuarto de la pantalla.
3. **Automatizaciones:** una cinta de código une los pasos en profundidad y se enciende con el paquete. Los pasos son chips de vidrio inclinados.
4. **Cierre:** un teléfono de vidrio negro iluminado en azul y rojo escribe la primera conversación de WhatsApp; es el "sujeto" del pin GIRLBOSS.

**Se retiraron:** la nube/flor, las ventanas en el titular, el tracking y el planeta.
