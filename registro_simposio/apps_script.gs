// Registro Simposio · Cátedra de Ciudades (12 nov 2026)
// Pegar en un Apps Script ligado a un Google Sheet nuevo → Implementar → Aplicación web
// (Ejecutar como: Yo · Acceso: Cualquiera) → copiar la URL /exec en APPS_SCRIPT_URL de index.html.
function doPost(e) {
  var p = e.parameter || {};
  function safe(v){ v = String(v || '').trim().slice(0,200); return /^[=+\-@]/.test(v) ? "'" + v : v; }
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(['Fecha','Nombre','Correo','Teléfono','Organización','Modalidad','Origen']);
  sh.appendRow([new Date(), safe(p.nombre), safe(p.correo), "'" + safe(p.telefono), safe(p.organizacion), safe(p.modalidad), safe(p.origen)]);
  return ContentService.createTextOutput('ok');
}
