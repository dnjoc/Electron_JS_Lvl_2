const { clipboard, contextBridge } = require("electron");
contextBridge.exposeInMainWorld("api", {
  //Copiar en el Clipboard mediante el contexBridge
  copyToClipboard: (text) => {
    clipboard.writeText(text);
    setTimeout(() => {
      mensaje.innerText = "Ruta copiada con exito al portapapeles";
    }, 500);
  },
});
//mostrar en el input la ruta del archivo
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("ruta");
  input.value = process.execPath;
});
