// All site copy, ES and EN. Facts come only from PRODUCT.md; nothing here is invented (no clients, figures or testimonials).
export const WHATSAPP_NUMBER = '+57 313 668 2674'
export const WHATSAPP_URL = 'https://wa.me/573136682674'
export const INSTAGRAM_URL = 'https://www.instagram.com/pagxstudio/'
// from the client (2026-10-10); the footer shows each one only when set
export const LINKEDIN_URL = 'https://www.linkedin.com/company/pagxstudio/'
export const EMAILS: string[] = ['sergioq@pagxstudio.com', 'alanp@pagxstudio.com']

const es = {
  lang: 'es',
  meta: {
    title: 'PagX Studio · Sitios web que no se olvidan',
    description: 'Estudio de diseño web en Pereira. Sitios nuevos y rediseños visuales para presentar tus servicios y proyectos con claridad. Diseño para móvil y escritorio, con alcance y fechas acordados.',
  },
  skip: 'Saltar al contenido',
  nav: { concepts: 'Conceptos', automations: 'Automatizaciones', portfolio: 'Portafolio', portfolioHref: '/portafolio/', home: '/', quote: 'Cotizar', theme: 'Modo oscuro', menu: 'Menú', close: 'Cerrar', label: 'Principal', other: 'English', otherHref: '/en/' },
  hero: {
    title: 'Sitios que no se olvidan.',
    sub: 'Sitios nuevos y rediseños visuales para mostrar mejor lo que vendes y facilitar las consultas de tus clientes. Diseño para móvil y escritorio, con alcance y fechas acordados desde el inicio.',
    cta: 'Hablemos de tu web',
    secondary: 'Ver portafolio',
    tag: 'Estudio web · Pereira, CO',
    specs: [
      { big: '10–25 días', small: 'Entrega con fechas fijas desde el inicio' },
      { big: '1 mes', small: 'Mantenimiento incluido' },
      { big: 'A medida', small: 'Sitios, tiendas Shopify y automatizaciones' },
    ],
    scroll: 'Desliza: entra al horizonte',
  },
  concepts: {
    eyebrow: 'Conceptos',
    title: 'Así podría verse tu negocio.',
    intro: 'Dos conceptos de PagX para marcas ficticias: un estudio de arquitectura y una tienda de café. No son clientes; son el nivel de diseño que entregamos.',
    label: 'Concepto de PagX · marca ficticia',
    pending: 'Diseño en proceso',
    scrollHint: 'Desliza dentro del sitio',
    glamping: {
      n: '01',
      name: 'Bruma',
      kind: 'Glamping en las montañas de Risaralda',
      text: 'Un sitio que vende la noche en la montaña antes de mostrar la cama: fotografía a pantalla completa, disponibilidad clara y reserva por WhatsApp en dos toques.',
      points: ['Hero en video donde solo se mueve la niebla', 'El valle se llena de niebla con el scroll', 'Reserva con calendario y WhatsApp'],
      alt: 'Diseño del sitio web de Bruma, un glamping ficticio, en escritorio.',
      altMobile: 'Diseño del sitio de Bruma en un teléfono.',
    },
    architecture: {
      n: '01',
      name: 'PAGX Architecture',
      kind: 'Estudio de arquitectura',
      text: 'Un estudio que vende casas en terreno difícil mostrando una sola casa: Casa Niebla, en una ladera, desde la tarde gris hasta que se enciende la última lámpara.',
      points: ['Hero en video donde solo se mueve la niebla', 'Con el scroll, la casa pasa de la tarde a la hora azul', 'Materiales y casas seleccionadas a pantalla completa'],
      alt: 'Sitio web de PAGX Architecture, un estudio de arquitectura ficticio, en escritorio.',
      altMobile: 'Sitio de PAGX Architecture en un teléfono.',
    },
    shop: {
      n: '02',
      name: 'Cumbre',
      kind: 'Tienda Shopify de café de origen',
      text: 'Una tienda de plantilla convertida en marca: la misma operación en Shopify, con fotografía de producto, fichas que cuentan el origen y un carrito sin fricción.',
      points: ['Rework visual de la tienda', 'Fichas de producto', 'Carrito y checkout de Shopify'],
      compare: 'Arrastra la barra para comparar la tienda de plantilla con la versión PagX. La versión PagX funciona: elige tamaño y molienda y agrégala al carrito.',
      tryHint: 'Pruébala: agrega al carrito',
      compareBtn: 'Comparar',
      slider: 'Comparar antes y después',
      before: 'Antes',
      after: 'Después',
      altBefore: 'Tienda de café con una plantilla genérica.',
      altAfter: 'La misma tienda de café rediseñada por PagX.',
      altMobile: 'Diseño de la tienda Cumbre en un teléfono.',
    },
  },
  automations: {
    eyebrow: 'Automatizaciones',
    title: 'Automatizaciones que trabajan mientras tú no.',
    intro: 'Elige un caso y mira cómo fluye. Cada automatización se diseña para tu operación y se cotiza por WhatsApp.',
    label: 'Casos de uso',
    kinds: { trigger: 'Cuando', step: 'Entonces', result: 'Resultado' },
    preview: 'Lo que ve tu cliente',
    replay: 'Ver de nuevo',
    cases: [
      {
        name: 'Reservas por WhatsApp',
        short: 'Glampings y alojamientos',
        steps: [
          { kind: 'trigger', title: 'Un huésped escribe', text: 'Pregunta por el domo para el sábado.' },
          { kind: 'step', title: 'El bot revisa tu calendario', text: 'Consulta la disponibilidad real de cada domo.' },
          { kind: 'step', title: 'Ofrece fechas y precio', text: 'Si el sábado está ocupado, propone la noche libre más cercana.' },
          { kind: 'step', title: 'Envía el enlace de pago', text: 'El huésped paga sin salir del chat.' },
          { kind: 'result', title: 'Reserva confirmada', text: 'El calendario se bloquea y a ti te llega el aviso.' },
        ],
        chat: [
          { from: 'in', text: 'Hola, ¿tienen el domo libre este sábado?' },
          { from: 'out', text: 'El sábado está reservado, pero el viernes 10 está libre: $ 480.000 la noche para dos. ¿Te lo aparto?' },
          { from: 'in', text: 'Sí, el viernes.' },
          { from: 'out', text: 'Listo. Aquí está el enlace de pago para confirmar.' },
        ],
      },
      {
        name: 'Pedidos de tu tienda',
        short: 'Tiendas Shopify',
        steps: [
          { kind: 'trigger', title: 'Entra un pedido nuevo', text: 'Shopify registra la compra.' },
          { kind: 'step', title: 'Confirmación por WhatsApp', text: 'El cliente recibe el resumen de su pedido al instante.' },
          { kind: 'step', title: 'Aviso de despacho', text: 'Cuando despachas, el número de guía le llega solo.' },
          { kind: 'result', title: 'Cliente tranquilo', text: 'Menos mensajes preguntando dónde está el pedido.' },
        ],
        chat: [
          { from: 'out', text: 'Hola, Ana. Recibimos tu pedido: Cumbre 1.800, 250 g.' },
          { from: 'out', text: 'Tu pedido ya va en camino. Te dejamos el número de guía para seguirlo.' },
          { from: 'in', text: '¡Gracias!' },
        ],
      },
      {
        name: 'Carritos abandonados',
        short: 'Ventas que casi se van',
        steps: [
          { kind: 'trigger', title: 'Alguien deja el carrito', text: 'Agregó productos y no pagó.' },
          { kind: 'step', title: 'Espera una hora', text: 'Sin presionar: le da tiempo.' },
          { kind: 'step', title: 'Le recuerda lo que dejó', text: 'Con la foto del producto y un enlace directo al pago.' },
          { kind: 'result', title: 'La venta vuelve', text: 'El cliente termina la compra donde la dejó.' },
        ],
        chat: [
          { from: 'out', text: 'Dejaste Cumbre 1.800 en tu carrito. Te lo guardamos hasta mañana.' },
          { from: 'out', text: 'Terminar mi compra →' },
        ],
      },
      {
        name: 'Atención 24/7',
        short: 'Preguntas repetidas',
        steps: [
          { kind: 'trigger', title: 'Llega una pregunta', text: 'A las 11 de la noche, por WhatsApp o Instagram.' },
          { kind: 'step', title: 'El bot responde con tu información', text: 'Horarios, precios, ubicación y políticas.' },
          { kind: 'step', title: 'Si no sabe, te la pasa', text: 'La conversación te llega con todo el contexto.' },
          { kind: 'result', title: 'Nadie se queda sin respuesta', text: 'Tú atiendes solo lo que necesita a una persona.' },
        ],
        chat: [
          { from: 'in', text: '¿Aceptan mascotas?' },
          { from: 'out', text: 'Sí, en el Domo Palma. Tiene un recargo de $ 30.000 por noche.' },
        ],
      },
    ],
  },
  closing: {
    eyebrow: 'Contacto',
    specs: ['WhatsApp', 'Pereira, Colombia', 'ES / EN'],
    title: 'Hablemos de tu sitio.',
    text: 'Compártenos tu negocio, tu web o Instagram y el servicio que quieres destacar. Revisamos el encaje y acordamos contigo el alcance, las fechas y la inversión antes de empezar.',
    number: 'O escribe directo a',
    copy: 'Copiar número',
    copied: 'Número copiado',
    phone: 'Abrir WhatsApp',
    chat: [
      { from: 'in', text: 'Hola, quiero renovar la web de mi negocio.' },
      { from: 'out', text: '¡Hola! Envíanos tu web o Instagram. ¿Qué servicio quieres destacar?' },
      { from: 'in', text: 'Quiero que se vean mis proyectos y que pedir una cotización sea más fácil.' },
      { from: 'out', text: 'Con eso definimos la propuesta: alcance, fechas e inversión antes de empezar.' },
    ],
  },
  footer: { place: 'Pereira, Colombia', instagram: 'Instagram', write: 'Contacto', follow: 'Redes', studio: 'Estudio', made: 'Hecho en Pereira, Colombia', rights: 'Todos los derechos reservados.', top: 'Volver arriba' },
  notFound: { title: 'Esta página no existe.', back: 'Volver al inicio' },
  portfolio: {
    title: 'Portafolio · PagX Studio',
    description: 'Anatomía de un sitio: cada web de PagX desarmada en sus capas, código, rejilla, imagen y tipografía, que se ensamblan frente a ti. Bruma, Cumbre, Sotobosque, La Villa, Arvena, PAGX Architecture, DSTRTO y Nivel B2.',
    otherHref: '/en/portfolio/',
    heading: 'Anatomía de un sitio.',
    loading: 'Ensamblando',
    hint: 'Desliza para ensamblar',
    hintTouch: 'Desliza hacia arriba para ensamblar',
    assemble: 'Ensamblar',
    explode: 'Desarmar',
    layers: ['Código', 'Rejilla', 'Sistema', 'Imagen', 'Tipografía', 'Móvil'],
    live: 'Sitio en vivo',
    next: 'Siguiente',
    prev: 'Anterior',
    chapters: 'Proyectos',
    enter: 'Entrar al sitio',
    concept: 'Concepto de PagX · marca ficticia',
    real: 'Sitio real hecho por PagX',
    arvena: { name: 'Arvena', kind: 'Tienda de ropa deportiva' },
    dstrto: { name: 'DSTRTO', kind: 'Tienda de tenis en Pereira' },
    drift: { name: 'Nivel B2', kind: 'Concesionario de carros en un sótano' },
    architecture: { name: 'PAGX Architecture', kind: 'Estudio de arquitectura' },
    sotobosque: { name: 'Sotobosque', kind: 'Perfumería botánica' },
    villa: { name: 'La Villa', kind: 'Instituto educativo', tag: 'Concepto de PagX · proyecto de arquitectura' },
    endTitle: '¿El tuyo es el siguiente?',
    endText: 'Cuéntanos de tu negocio por WhatsApp y lo ensamblamos.',
  },


}

type Dict = typeof es

const en: Dict = {
  lang: 'en',
  meta: {
    title: 'PagX Studio · Websites no one forgets',
    description: 'Web design studio in Pereira, Colombia. Custom websites and visual redesigns that present your services and work clearly. Desktop and mobile design, with an agreed scope and timeline.',
  },
  skip: 'Skip to content',
  nav: { concepts: 'Concepts', automations: 'Automations', portfolio: 'Portfolio', portfolioHref: '/en/portfolio/', home: '/en/', quote: 'Get a quote', theme: 'Dark mode', menu: 'Menu', close: 'Close', label: 'Main', other: 'Español', otherHref: '/' },
  hero: {
    title: 'Websites no one forgets.',
    sub: 'Custom websites and visual redesigns that show your work clearly and make it easier for customers to ask for a quote. Designed for desktop and mobile, with scope and dates agreed up front.',
    cta: 'Discuss your website',
    secondary: 'Explore our work',
    tag: 'Web studio · Pereira, CO',
    specs: [
      { big: '10–25 days', small: 'Delivery on fixed dates from day one' },
      { big: '1 month', small: 'Maintenance included' },
      { big: 'Custom', small: 'Websites, Shopify stores and automations' },
    ],
    scroll: 'Scroll: cross the horizon',
  },
  concepts: {
    eyebrow: 'Concepts',
    title: 'This is how your business could look.',
    intro: "Two PagX concepts for fictional brands: an architecture studio and a coffee store. They aren't clients; they're the level of design we deliver.",
    label: 'PagX concept · fictional brand',
    pending: 'Design in progress',
    scrollHint: 'Scroll inside the site',
    glamping: {
      n: '01',
      name: 'Bruma',
      kind: 'Glamping in the mountains of Risaralda',
      text: 'A site that sells the night in the mountains before it shows the bed: full-screen photography, clear availability and booking on WhatsApp in two taps.',
      points: ['Video hero where only the fog moves', 'The valley fills with fog as you scroll', 'Booking with a calendar and WhatsApp'],
      alt: 'Desktop design of the website for Bruma, a fictional glamping.',
      altMobile: 'Design of the Bruma site on a phone.',
    },
    architecture: {
      n: '01',
      name: 'PAGX Architecture',
      kind: 'Architecture studio',
      text: 'A studio that sells houses on difficult ground by showing a single house: Casa Niebla, on a hillside, from grey afternoon until the last lamp comes on.',
      points: ['Video hero where only the fog moves', 'As you scroll, the house goes from afternoon to blue hour', 'Materials and selected houses, full screen'],
      alt: 'Desktop website for PAGX Architecture, a fictional architecture studio.',
      altMobile: 'The PAGX Architecture site on a phone.',
    },
    shop: {
      n: '02',
      name: 'Cumbre',
      kind: 'Single-origin coffee Shopify store',
      text: 'A template store turned into a brand: the same Shopify operation, with product photography, product pages that tell the origin and a frictionless cart.',
      points: ['Visual store rework', 'Product pages', 'Shopify cart and checkout'],
      compare: 'Drag the bar to compare the template store with the PagX version. The PagX version works: pick a size and grind and add it to the cart.',
      tryHint: 'Try it: add to cart',
      compareBtn: 'Compare',
      slider: 'Compare before and after',
      before: 'Before',
      after: 'After',
      altBefore: 'A coffee store on a generic template.',
      altAfter: 'The same coffee store redesigned by PagX.',
      altMobile: 'Design of the Cumbre store on a phone.',
    },
  },
  automations: {
    eyebrow: 'Automations',
    title: 'Automations that work while you don’t.',
    intro: 'Pick a case and watch it flow. Every automation is designed around how you operate and quoted on WhatsApp.',
    label: 'Use cases',
    kinds: { trigger: 'When', step: 'Then', result: 'Result' },
    preview: 'What your customer sees',
    replay: 'Play again',
    cases: [
      {
        name: 'WhatsApp bookings',
        short: 'Glampings and stays',
        steps: [
          { kind: 'trigger', title: 'A guest writes in', text: 'Asks about the dome for Saturday.' },
          { kind: 'step', title: 'The bot checks your calendar', text: 'It reads the real availability of each dome.' },
          { kind: 'step', title: 'Offers dates and price', text: 'If Saturday is taken, it suggests the closest open night.' },
          { kind: 'step', title: 'Sends the payment link', text: 'The guest pays without leaving the chat.' },
          { kind: 'result', title: 'Booking confirmed', text: 'The calendar is blocked and you get notified.' },
        ],
        chat: [
          { from: 'in', text: 'Hi, is the dome free this Saturday?' },
          { from: 'out', text: 'Saturday is booked, but Friday the 10th is open: COP 480,000 a night for two. Should I hold it?' },
          { from: 'in', text: 'Yes, Friday.' },
          { from: 'out', text: 'Done. Here is the payment link to confirm.' },
        ],
      },
      {
        name: 'Store orders',
        short: 'Shopify stores',
        steps: [
          { kind: 'trigger', title: 'A new order comes in', text: 'Shopify records the purchase.' },
          { kind: 'step', title: 'WhatsApp confirmation', text: 'The customer gets the order summary right away.' },
          { kind: 'step', title: 'Shipping notice', text: 'When you ship, the tracking number goes out on its own.' },
          { kind: 'result', title: 'A calm customer', text: 'Fewer messages asking where the order is.' },
        ],
        chat: [
          { from: 'out', text: 'Hi Ana. We got your order: Cumbre 1.800, 250 g.' },
          { from: 'out', text: 'Your order is on its way. Here is your tracking number.' },
          { from: 'in', text: 'Thanks!' },
        ],
      },
      {
        name: 'Abandoned carts',
        short: 'Sales that almost left',
        steps: [
          { kind: 'trigger', title: 'Someone leaves the cart', text: 'Added products and didn’t pay.' },
          { kind: 'step', title: 'Waits an hour', text: 'No pressure: it gives them time.' },
          { kind: 'step', title: 'Reminds them what they left', text: 'With the product photo and a direct link to checkout.' },
          { kind: 'result', title: 'The sale comes back', text: 'The customer finishes where they left off.' },
        ],
        chat: [
          { from: 'out', text: 'You left Cumbre 1.800 in your cart. We’ll hold it until tomorrow.' },
          { from: 'out', text: 'Finish my purchase →' },
        ],
      },
      {
        name: '24/7 answers',
        short: 'Repeated questions',
        steps: [
          { kind: 'trigger', title: 'A question arrives', text: 'At 11 p.m., on WhatsApp or Instagram.' },
          { kind: 'step', title: 'The bot answers with your info', text: 'Hours, prices, location and policies.' },
          { kind: 'step', title: 'If it doesn’t know, it hands off', text: 'The conversation reaches you with full context.' },
          { kind: 'result', title: 'No one goes unanswered', text: 'You only handle what needs a person.' },
        ],
        chat: [
          { from: 'in', text: 'Do you allow pets?' },
          { from: 'out', text: 'Yes, in the Palma dome. There is a COP 30,000 fee per night.' },
        ],
      },
    ],
  },
  closing: {
    eyebrow: 'Contact',
    specs: ['WhatsApp', 'Pereira, Colombia', 'ES / EN'],
    title: "Let's talk about your site.",
    text: "Share your business, website or Instagram, and the service you want to highlight. We review the fit and agree on scope, dates and price with you before work begins.",
    number: 'Or message us directly at',
    copy: 'Copy number',
    copied: 'Number copied',
    phone: 'Open WhatsApp',
    chat: [
      { from: 'in', text: 'Hi, I would like to redesign my business website.' },
      { from: 'out', text: 'Hi! Send us your website or Instagram. Which service would you like to highlight?' },
      { from: 'in', text: 'I want to show my projects and make requesting a quote easier.' },
      { from: 'out', text: 'That gives us the brief: scope, dates and price agreed before we start.' },
    ],
  },
  footer: { place: 'Pereira, Colombia', instagram: 'Instagram', write: 'Contact', follow: 'Social', studio: 'Studio', made: 'Made in Pereira, Colombia', rights: 'All rights reserved.', top: 'Back to top' },
  notFound: { title: "This page doesn't exist.", back: 'Back to home' },
  portfolio: {
    title: 'Portfolio · PagX Studio',
    description: "Anatomy of a website: each PagX site taken apart into its layers, code, grid, imagery and type, that assemble in front of you. Bruma, Cumbre, Sotobosque, La Villa, Arvena, PAGX Architecture, DSTRTO and Nivel B2.",
    otherHref: '/portafolio/',
    heading: 'Anatomy of a website.',
    loading: 'Assembling',
    hint: 'Scroll to assemble',
    hintTouch: 'Swipe up to assemble',
    assemble: 'Assemble',
    explode: 'Take apart',
    layers: ['Code', 'Grid', 'System', 'Imagery', 'Type', 'Mobile'],
    live: 'Live site',
    next: 'Next',
    prev: 'Previous',
    chapters: 'Projects',
    enter: 'Enter the site',
    concept: 'PagX concept · fictional brand',
    real: 'A real site made by PagX',
    arvena: { name: 'Arvena', kind: 'Activewear store' },
    dstrto: { name: 'DSTRTO', kind: 'Sneaker store in Pereira' },
    drift: { name: 'Nivel B2', kind: 'Car dealership in a basement garage' },
    architecture: { name: 'PAGX Architecture', kind: 'Architecture studio' },
    sotobosque: { name: 'Sotobosque', kind: 'Botanical perfumery' },
    villa: { name: 'La Villa', kind: 'School building', tag: 'PagX concept · architecture project' },
    endTitle: 'Is yours next?',
    endText: "Tell us about your business on WhatsApp and we'll assemble it.",
  },


}

export const dict = { es, en }
export type Lang = keyof typeof dict
export type { Dict }

// A visitor reviews and sends the brief inside WhatsApp; this link never submits it.
export function whatsappFor(lang: Lang): string {
  const message = lang === 'en'
    ? 'Hi PAGX, I would like to discuss a website.\n\nMy business:\nMy website or Instagram:\nI need: a new site / a redesign\nThe service or product I want to highlight:'
    : 'Hola PAGX, quiero conversar sobre una web.\n\nMi negocio:\nMi web o Instagram:\nMe interesa: sitio nuevo / rediseño\nEl servicio o producto que quiero destacar:'
  return WHATSAPP_URL + '?text=' + encodeURIComponent(message)
}
