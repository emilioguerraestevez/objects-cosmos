# Formulario único de registro — para IT

Reemplaza el envío semanal de Excel por dependencia: cada área captura su
propia atención en el momento, eligiendo el servicio de un catálogo cerrado
en vez de escribirlo a mano. Resuelve en la fuente el problema que pasamos
la semana limpiando en `cuauhtemoc.db` (servicios inventados, nombres de
sede capturados como si fueran servicio, etc.).

## Qué es

- `app.py` — servidor FastAPI. Sirve el formulario (`GET /`) y dos endpoints:
  - `GET /api/servicios?dependencia=X` — lista de servicios del catálogo para esa dependencia.
  - `POST /api/registro` — valida y guarda un registro nuevo.
  - `GET /api/resumen?codigo=X` — cuántos registros lleva cada dependencia (para monitoreo).
- `../catalogo/CATALOGO_SERVICIOS.csv` — el catálogo de 217 servicios en 12 dependencias.
  El formulario lo lee al arrancar; si el catálogo cambia, reinicia el servidor.
- `registros.db` — SQLite propio, tabla `registros`. **No es `cuauhtemoc.db`** — los
  registros nuevos se quedan aquí hasta el corte semanal (ver abajo).

## Cómo correrlo

Necesita `fastapi`, `uvicorn` y `pydantic`. Ya probado contra:

    fastapi==0.139.0 / pydantic==2.13.4

```
pip install fastapi uvicorn pydantic
uvicorn app:app --host 0.0.0.0 --port 8790
```

## Antes de exponerlo

1. **Cambiar `CODIGO_ACCESO`** en `app.py` (línea ~30) — hoy dice `cuh2026`,
   es un código de ejemplo. Es un solo código compartido para las 12
   dependencias — decisión tomada, no por-dependencia.
2. Servirlo detrás de HTTPS (el código de acceso viaja en el body del POST,
   no en la URL, pero igual conviene TLS).
3. Cada dependencia puede recibir el mismo link con `?dep=<clave>` para que
   su desplegable de dependencia venga ya fijo (no elegible). Claves válidas:
   `Servicios Urbanos, Desarrollo Social, Participación Ciudadana, Genero,
   Cultura, Jurídico, Gobierno, Seguridad, Protección Civil, Obras,
   Administración, Oficina de la Alcaldía`.

## Incorporación a la base maestra — cadencia semanal

Los registros del formulario NO se mezclan solos con `cuauhtemoc.db`. Se
incorporan **una vez por semana, igual que el SUAC y las listas de las
dependencias** — mismo ritmo, mismo tratamiento (decisión del usuario,
24-ago-2026).

`incorporar_formulario.py` es la referencia de cómo hacerlo: lee las filas
nuevas de `registros.db` (marca `incorporado=0`), las inserta en la tabla
`solicitudes` de `cuauhtemoc.db` con `fuente='Formulario'`, y las marca
`incorporado=1` para no duplicarlas la próxima semana. Ajustar rutas/schema
si la infraestructura oficial usa otro motor de base de datos.

## Qué NO decide este formulario

- No resuelve el problema de fondo de "personas que no son personas"
  (marcadores de canal en el padrón) — eso es un pendiente aparte.
- No sustituye al SUAC ni a las listas de las dependencias que ya funcionan
  bien (Participación Ciudadana, Administración) — es para las que hoy
  mandan Excel semanal con huecos de captura.
