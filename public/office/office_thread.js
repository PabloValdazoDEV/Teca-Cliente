/* SPDX-License-Identifier: MIT — adapted from allotropia/zetajs web-office example. */
/* global Module */
'use strict';

let zetajs;
let css;
let desktop;
let xModel;

function loadFile(filename) {
  xModel = desktop.loadComponentFromURL(`file:///tmp/office/${filename}`, '_default', 0, []);
  const controller = xModel.getCurrentController();
  controller.getFrame().getContainerWindow().FullScreen = true;
  zetajs.mainPort.postMessage({ cmd: 'ui_ready' });
}

function start() {
  desktop = css.frame.Desktop.create(zetajs.getUnoComponentContext());
  zetajs.mainPort.onmessage = (event) => {
    if (event.data.cmd === 'upload') loadFile(event.data.filename);
    else if (event.data.cmd === 'download') {
      xModel.store();
      zetajs.mainPort.postMessage({ cmd: 'download' });
    } else throw Error(`Unknown message command: ${event.data.cmd}`);
  };
  zetajs.mainPort.postMessage({ cmd: 'thr_running' });
}

Module.zetajs.then((value) => {
  zetajs = value;
  css = zetajs.uno.com.sun.star;
  start();
});
