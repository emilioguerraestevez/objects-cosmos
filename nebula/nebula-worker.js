/* Nebula · motor en un Web Worker (Pyodide). Los archivos nunca salen del navegador. */
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
let py = null;
const WHEELS = { et_xmlfile: 'et_xmlfile-2.0.0-py3-none-any.whl', openpyxl: 'openpyxl-3.1.5-py2.py3-none-any.whl' };
const post = (tipo, dato, tr) => self.postMessage({ tipo, dato }, tr || []);

async function iniciar() {
  post('estado', 'Preparando el motor. La primera vez tarda cerca de un minuto…');
  py = await loadPyodide();
  py.setStdout({ batched: s => post('log', s) });
  py.setStderr({ batched: s => post('log', s) });
  await py.loadPackage(['pandas', 'micropip']);
  const wh = ['et_xmlfile', 'openpyxl'].map(n => new URL('wheels/' + WHEELS[n], self.location.href).href);
  await py.runPythonAsync('import micropip\nawait micropip.install(' + JSON.stringify(wh) + ')');
  const r = await fetch('nebula_bundle.zip', { cache: 'no-store' });
  py.unpackArchive(await r.arrayBuffer(), 'zip', { extractDir: '/nebula' });
  py.runPython("import sys; sys.path.insert(0, '/nebula')");
  post('listo');
}

async function correr(d) {
  py.FS.mkdirTree('/work/in'); py.FS.mkdirTree('/work/out');
  const rutas = {};
  for (const [rol, f] of Object.entries(d.archivos)) {
    const p = '/work/in/' + rol; py.FS.writeFile(p, new Uint8Array(f)); rutas[rol] = p;
  }
  const sl = [];
  (d.sueltos || []).forEach((s, i) => { const ext = (s.nombre.match(/\.(xlsx|csv)$/i) || ['.xlsx'])[0]; const p = '/work/in/suelto_' + i + ext; py.FS.writeFile(p, new Uint8Array(s.buf)); sl.push([p, s.prefijo, s.nombre]); });
  py.globals.set('sueltos_js', JSON.stringify(sl));
  py.globals.set('rutas_js', JSON.stringify(rutas));
  py.globals.set('corte_js', d.corte);
  const resultado = py.runPython(`
import json, pipeline
r = json.loads(rutas_js)
res = pipeline.correr(r.get('concentrado'), r.get('suac'), r.get('amazonica'), r.get('padron_previo'), corte_js, '/work/out/NEBULA_' + corte_js,
                      r.get('base_previa'), log=print, sueltos=[tuple(x) for x in json.loads(sueltos_js)])
json.dumps({'zip': res['zip'], 'csv_base': res['archivos']['csv_base'], 'csv_padron': res['archivos']['csv_padron'],
            'avisos': res['avisos'], 'filas': res['filas'], 'personas': res['personas'], 'altas': res['altas']})
`);
  const res = JSON.parse(resultado);
  const leer = p => { const u = py.FS.readFile(p); return u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength); };
  const zip = leer(res.zip), cb = leer(res.csv_base), cp = res.csv_padron ? leer(res.csv_padron) : null;
  post('resultado', { res, zip, cb, cp }, [zip, cb].concat(cp ? [cp] : []));
  // libera memoria
  py.runPython("import shutil; shutil.rmtree('/work', ignore_errors=True)");
}

self.onmessage = async e => {
  try {
    if (e.data.tipo === 'iniciar') await iniciar();
    if (e.data.tipo === 'correr') await correr(e.data.dato);
  } catch (err) { post('error', String(err && err.stack || err)); }
};
