/* SPDX-License-Identifier: MIT — adapted from allotropia/zetajs web-office example. */
/* global Module */
'use strict';

// Comandos .uno que no tienen sentido dentro de TECA o que dejan el editor inservible
// (cerrar/salir destruye la ventana y LibreOffice WebAssembly no puede reabrirse sin
// recargar). Se bloquean con un interceptor de dispatch en el marco del documento, lo
// que anula también sus atajos (Ctrl+Q, Ctrl+W, Ctrl+O, Ctrl+N, Ctrl+P…) y los deja
// en gris en los menús contextuales. (La lista "Disabled" de la configuración no tiene
// efecto en este runtime: comprobado.)
const DISABLED_COMMANDS = [
  // Cerrar / salir / ventanas
  'Quit', 'CloseDoc', 'CloseWin', 'CloseWindow', 'NewWindow', 'WindowList', 'FullScreen',
  // Abrir / nuevo / plantillas / remoto
  'Open', 'OpenUrl', 'OpenRemote', 'OpenTemplate', 'AddDirect', 'NewDoc', 'Reload', 'EditDoc',
  'StartCenter', 'RecentFileList',
  // Guardar fuera de TECA: el guardado real lo hace el botón "Guardar nueva versión"
  'Save', 'SaveAs', 'SaveAsRemote', 'SaveAll', 'SaveACopy', 'ExportTo', 'ExportToPDF',
  'ExportDirectToPDF', 'ExportToEPUB', 'ExportDirectToEPUB', 'SendMail', 'SendMailDocAsPDF',
  'SendMailDocAsMS', 'SendMailDocAsOOo', 'SendMailDocAsFormat', 'VersionDialog', 'Signature',
  // Impresión (no funciona en WebAssembly)
  'Print', 'PrintDefault', 'PrinterSetup', 'PrintPreview',
  // Configuración, personalización, extensiones, ayuda online
  'OptionsTreeDialog', 'ConfigureDialog', 'ToolbarMode', 'Menubar', 'ExtensionManager',
  'HelpIndex', 'ExtendedHelp', 'HelpOnHelp', 'OnlineHelp',
  // Macros y scripts
  'MacroDialog', 'RunMacro', 'BasicIDEAppear', 'MacroOrganizer', 'MacroSignature', 'ScriptOrganizer',
  'MacroRecorder', 'StopRecording', 'OpenXMLFilterSettings',
  // Hipervínculos que abrirían otra ventana
  'OpenHyperlinkOnCursor', 'OpenHyperlinkLocation', 'OpenSmartTagMenuOnCursor',
];

// Únicas barras que se dejan visibles: la de formato de cada módulo.
const KEPT_TOOLBARS = new Set([
  'private:resource/toolbar/textobjectbar', // Writer: formato de texto
  'private:resource/toolbar/formatobjectbar', // Calc: formato de celdas
]);

let zetajs;
let css;
let context;
let desktop;
let config;
let xModel;
let ctrl;
let reportedModified = false;

const BLOCKED_URLS = new Set(DISABLED_COMMANDS.map((command) => `.uno:${command}`));
// Mismos comandos por número de slot (algunas rutas internas los piden así).
for (const slot of [5300, 5501, 5503, 5504, 5621, 5627]) BLOCKED_URLS.add(`slot:${slot}`);

// Familias completas: cada módulo tiene sus variantes (p. ej. Cmd/Ctrl+O en Writer
// envía .uno:OpenFromWriter y en Calc .uno:OpenFromCalc).
const BLOCKED_PREFIXES = /^\.uno:(Open|Close|Save|Export|Print|SendMail|Macro|NewDoc|AddDirect|Quit)/;

function isBlockedUrl(url) {
  const complete = String(url?.Complete || '');
  const base = complete.split('?')[0];
  return BLOCKED_URLS.has(base)
    || BLOCKED_PREFIXES.test(base)
    || /^(macro|vnd\.sun\.star\.script):/i.test(complete);
}

function post(message) {
  zetajs.mainPort.postMessage(message);
}

function safely(label, fn) {
  try {
    return fn();
  } catch (error) {
    const text = `${label}: ${error?.message || error}`;
    console.warn(`[teca-office] ${text}`);
    post({ cmd: 'log', text });
    return undefined;
  }
}

function configureOffice() {
  config = css.configuration.ReadWriteAccess.create(context, 'en-US');

  safely('seguridad de macros', () => {
    const scripting = config.getByHierarchicalName('/org.openoffice.Office.Common/Security/Scripting');
    scripting.setPropertyValue('MacroSecurityLevel', 3);
    scripting.setPropertyValue('DisableMacrosExecution', true);
  });

  safely('guardar configuración', () => config.commitChanges());
}

function transformUrl(command) {
  const ioparam = { val: new css.util.URL({ Complete: `.uno:${command}` }) };
  css.util.URLTransformer.create(context).parseStrict(ioparam);
  return ioparam.val;
}

function dispatch(command) {
  if (!ctrl) return;
  safely(`dispatch ${command}`, () => {
    const url = transformUrl(command);
    ctrl.queryDispatch(url, '_self', 0)?.dispatch(url, []);
  });
}

function simplifyInterface() {
  const frame = ctrl.getFrame();
  const layout = frame.LayoutManager;

  safely('ocultar menú', () => layout.hideElement('private:resource/menubar/menubar'));
  safely('ocultar barras', () => {
    for (const element of layout.getElements()) {
      const url = element.ResourceURL;
      if (!url.startsWith('private:resource/toolbar/')) continue;
      if (KEPT_TOOLBARS.has(url)) {
        layout.lockWindow(url); // evita que se arrastre y quede flotando o perdida
      } else {
        layout.hideElement(url);
      }
    }
  });
  safely('ocultar barra lateral', () => ctrl.getSidebar().setVisible(false));
}

function blockDangerousCommands(frame) {
  let slave = null;
  let master = null;
  const interceptor = zetajs.unoObject([css.frame.XDispatchProviderInterceptor], {
    getSlaveDispatchProvider() { return slave; },
    setSlaveDispatchProvider(provider) { slave = provider; },
    getMasterDispatchProvider() { return master; },
    setMasterDispatchProvider(provider) { master = provider; },
    queryDispatch(url, target, flags) {
      if (isBlockedUrl(url)) return null;
      return slave ? slave.queryDispatch(url, target, flags) : null;
    },
    queryDispatches(requests) {
      return Array.from(requests, (request) => this.queryDispatch(request.FeatureURL, request.FrameName, request.SearchFlags));
    },
  });
  safely('interceptor de comandos', () => frame.registerDispatchProviderInterceptor(interceptor));
}

// Última barrera: aunque algo intente cerrar el documento, se veta. Cerrarlo dejaría
// el editor en blanco y obligaría a recargar.
function preventClosing() {
  const listener = zetajs.unoObject([css.util.XCloseListener], {
    disposing() {},
    notifyClosing() {},
    queryClosing() {
      zetajs.throwUnoException(new css.util.CloseVetoException({ Message: 'TECA: el documento no se puede cerrar desde el editor' }));
    },
  });
  safely('veto de cierre', () => xModel.addCloseListener(listener));
}

// Esc (y otras rutas internas) sacan la ventana de pantalla completa y dejan a la
// vista la barra de título con su botón ✕. Se restaura enseguida.
function keepFullScreen(frame) {
  const topWindow = frame.getContainerWindow();
  setInterval(() => {
    safely('pantalla completa', () => {
      if (!topWindow.FullScreen) {
        topWindow.FullScreen = true;
        // Qt no siempre repinta al primer intento: un segundo ciclo lo fuerza.
        setTimeout(() => safely('pantalla completa (repaso)', () => {
          topWindow.FullScreen = false;
          topWindow.FullScreen = true;
          post({ cmd: 'relayout' });
        }), 150);
      }
    });
  }, 300);
}

function watchModifications() {
  const listener = zetajs.unoObject([css.util.XModifyListener], {
    disposing() {},
    modified() {
      const modified = safely('estado de cambios', () => xModel.isModified()) ?? true;
      if (modified !== reportedModified) {
        reportedModified = modified;
        post({ cmd: 'modified', modified });
      }
    },
  });
  safely('vigilar cambios', () => xModel.addModifyListener(listener));
}

function loadFile(filename) {
  xModel = desktop.loadComponentFromURL(`file:///tmp/office/${filename}`, '_default', 0, []);
  ctrl = xModel.getCurrentController();
  const frame = ctrl.getFrame();
  frame.getContainerWindow().FullScreen = true;
  blockDangerousCommands(frame);
  preventClosing();
  keepFullScreen(frame);
  simplifyInterface();
  watchModifications();
  post({ cmd: 'ui_ready' });
}

function start() {
  context = zetajs.getUnoComponentContext();
  configureOffice();
  desktop = css.frame.Desktop.create(context);
  zetajs.mainPort.onmessage = (event) => {
    switch (event.data.cmd) {
      case 'upload':
        loadFile(event.data.filename);
        break;
      case 'download':
        xModel.store();
        reportedModified = false;
        post({ cmd: 'download' });
        post({ cmd: 'modified', modified: false });
        break;
      case 'undo':
        dispatch('Undo');
        break;
      case 'redo':
        dispatch('Redo');
        break;
      default:
        console.warn(`[teca-office] Comando desconocido: ${event.data.cmd}`);
    }
  };
  post({ cmd: 'thr_running' });
}

Module.zetajs.then((value) => {
  zetajs = value;
  css = zetajs.uno.com.sun.star;
  start();
});
