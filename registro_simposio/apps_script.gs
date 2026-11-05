// Registro Simposio · Cátedra de Ciudades (12 nov 2026)
// Pegar en el Apps Script ligado al Google Sheet → Implementar → Administrar implementaciones →
// editar la implementación existente → Versión: "Nueva versión" (así la URL /exec no cambia).
// Hoja 1 = registros. Hoja "Charlas" = una fila por correo con su selección actual.
function doPost(e) {
  var p = e.parameter || {};
  function safe(v){ v = String(v || '').trim().slice(0,200); return /^[=+\-@]/.test(v) ? "'" + v : v; }
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (p.accion === 'charlas') {
    var sh2 = ss.getSheetByName('Charlas') || ss.insertSheet('Charlas');
    if (sh2.getLastRow() === 0) sh2.appendRow(['Fecha','Correo','Nombre','Total','Charlas (ids)','Detalle','Registrado']);
    var correo = safe(p.correo).toLowerCase();
    var reg = ss.getSheets()[0], registrado = 'no';
    if (reg.getLastRow() > 1) {
      var cs = reg.getRange(2, 3, reg.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < cs.length; i++) if (String(cs[i][0]).trim().toLowerCase() === correo) { registrado = 'sí'; break; }
    }
    var row = [new Date(), correo, safe(p.nombre), safe(p.total), safe(p.charlas), String(p.detalle || '').slice(0,1000), registrado];
    var found = 0;
    if (sh2.getLastRow() > 1) {
      var ex = sh2.getRange(2, 2, sh2.getLastRow() - 1, 1).getValues();
      for (var j = 0; j < ex.length; j++) if (String(ex[j][0]).toLowerCase() === correo) { found = j + 2; break; }
    }
    if (found) sh2.getRange(found, 1, 1, row.length).setValues([row]); else sh2.appendRow(row);
    return ContentService.createTextOutput('ok');
  }

  var sh = ss.getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(['Fecha','Nombre','Correo','Teléfono','Organización','Modalidad','Origen']);
  sh.appendRow([new Date(), safe(p.nombre), safe(p.correo), "'" + safe(p.telefono), safe(p.organizacion), safe(p.modalidad), safe(p.origen)]);
  return ContentService.createTextOutput('ok');
}
