# Instrucciones para Asistentes de IA (Antigravity / Gemini)

## Entorno de Trabajo y Despliegue
- **IMPORTANTE:** El usuario revisa los cambios **ONLINE** en el dominio público (Cloudflare Pages), no en local.
- **Flujo Obligatorio:** Siempre que realices cambios en el código (HTML, JS, Astro, CSS) y le digas al usuario que compruebe los resultados, **DEBES hacer un `git commit` y un `git push`**. 
- Si no haces `git push`, Cloudflare no reconstruirá la web y el usuario seguirá viendo la versión antigua, lo que causa confusión y pérdida de tiempo.
- **Comando rápido de despliegue:** `git add . ; git commit -m "Actualización automática" ; git push`

## Resolución de Problemas (Troubleshooting)
- Si el usuario dice "no veo los cambios":
  1. Verifica que has hecho `git push`.
  2. Comprueba que no hay etiquetas HTML rotas (Astro es estricto).
  3. Comprueba el estado del repositorio (`git status`).
