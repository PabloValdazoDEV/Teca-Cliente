# Editor WebAssembly de TECA

El editor usa ZetaJS (MIT) y LibreOffice WebAssembly. Los documentos se cargan desde la API de TECA en memoria del navegador y, al guardar, se envían como una nueva versión al servidor.

Preparación local y despliegue:

1. `npm install`
2. `npm run office:runtime` (descarga una vez los cuatro archivos oficiales de ZetaOffice)
3. `npm run build`
4. Publicar `dist/`, incluyendo `dist/office/runtime/`.

El runtime queda ignorado por Git debido a su tamaño. En Plesk deben servirse `.wasm` como `application/wasm` y los archivos `soffice.*` con caché pública larga. Para usar temporalmente el CDN oficial se puede definir `VITE_ZETA_OFFICE_RUNTIME_URL=https://cdn.zetaoffice.net/zetaoffice_latest/`, aunque en producción clínica se recomienda alojarlo en el mismo dominio.
