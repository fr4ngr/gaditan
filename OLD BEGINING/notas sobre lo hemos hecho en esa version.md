# Notas sobre lo que hemos hecho en esta versión

## Cambios de Diseño en Tarjetas Hero y Títulos

- **Títulos de sección (`.section-title`)**: 
  - *(Revertido a petición)*: Se había modificado a un estilo "píldora" turquesa/azul, pero se ha dejado como estaba originalmente con el texto claro sobre fondo oscuro para mantener la legibilidad y estética original.

- **Tarjetas superiores (Hero)**:
  - Se reestructuró el HTML de las tarjetas rotativas en `src/components/Hero.astro`.
  - Ahora las tarjetas están divididas estructuralmente en dos bloques sólidos, imitando el diseño de las tarjetas de Tarifas:
    1. **Bloque izquierdo:** Fondo turquesa sólido (`var(--brand-cyan)`) con el icono en color azul oscuro (`var(--bg-base)`).
    2. **Bloque derecho:** Fondo claro (degradado muy sutil de blanco a gris claro) con los textos en azul oscuro/gris oscuro para máximo contraste.
  - Se añadieron pequeños **botones de acción (CTA)** turquesas en la esquina inferior derecha de cada tarjeta (ej. "Llamar", "Calcular", "Ver mapa") para incentivar el clic.
  - Se forzó la alineación izquierda de los textos y se mejoró el espaciado en la versión móvil (quitando la restricción de proporción `aspect-ratio`) para que las tarjetas sean más amplias y cómodas en pantallas pequeñas.
  - Se eliminó el fondo global unicolor de la tarjeta y se aplicó `padding: 0` junto con `overflow: hidden` para contener perfectamente los dos bloques de color de forma responsive.

## Sección Tarifas Oficiales
- Se modificó el fondo de las tarjetas de tarifas (Diurna, Nocturna e Interurbana) así como de la tarjeta de Suplementos a color blanco puro (`#ffffff`).
- El texto y los precios del interior de las tarjetas pasaron a color azul oscuro (`var(--bg-base)`) para lograr un alto contraste y legibilidad, acorde al estilo de la sección "Hero".
- Se ha sustituido el antiguo botón de alternancia por un control deslizante interactivo (estilo píldora o *segmented control*) situado en la parte superior derecha, encima de las tarjetas. Este control cuenta con dos posiciones (Día y Noche), animando suavemente una pastilla interior. Cuando se selecciona Noche, adopta un fondo azul oscuro con el deslizador en turquesa, y cuando se selecciona Día, muestra un aspecto diurno suave.

## Despliegue
- Todos estos cambios han sido guardados de forma segura (commit) y subidos (push) a la rama `main` del repositorio de GitHub, lo que dispara automáticamente la compilación y el despliegue de la nueva versión en los servidores de Cloudflare.
