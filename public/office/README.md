# Editor WebAssembly de TECA

El editor usa ZetaJS (MIT) y LibreOffice WebAssembly. Los documentos se cargan desde la API de TECA en memoria del navegador y, al guardar, se envían como una nueva versión al servidor.

Preparación local y despliegue:

1. `npm install`
2. `npm run office:runtime` (descarga una vez los cuatro archivos oficiales de ZetaOffice)
3. `npm run build`
4. Publicar `dist/`, incluyendo `dist/office/runtime/`.

El runtime queda ignorado por Git debido a su tamaño. En Plesk deben servirse `.wasm` como `application/wasm` y los archivos `soffice.*` con caché pública larga. En producción se aloja en el mismo dominio que TECA: no debe configurarse un CDN ni una URL externa para `VITE_ZETA_OFFICE_RUNTIME_URL`.

## Caché, interfaz simplificada y bloqueos

- `runtime-cache.js` + `sw.js`: el runtime se guarda en Cache Storage y se sirve desde el service worker; solo se vuelve a descargar si cambia `runtime/manifest.json` (`npm run office:manifest`).
- `office_thread.js`: oculta la barra de menús, la barra lateral y todas las barras salvo la de formato; bloquea con un interceptor de dispatch los comandos que rompen el editor (abrir, cerrar, salir, guardar fuera de TECA, imprimir, macros…); veta el cierre del documento y restaura la pantalla completa si se pierde (Esc).
- Ctrl/Cmd+S guarda una nueva versión en TECA. La página avisa si hay cambios sin guardar al salir.
