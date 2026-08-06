# objects · cosmos.ai

Entregas de campo publicadas como objetos con dirección propia.

    objects-cosmos.ai/                    índice de entregas
    objects-cosmos.ai/podas/2026-07-29/   ese corte, permanente
    objects-cosmos.ai/podas/              el corte vigente

Cada corte conserva su URL: un enlace compartido hoy sigue mostrando el mismo
corte meses después. La ruta sin fecha apunta al vigente.

## Cómo se regenera

No editar los `index.html` a mano. Se generan con `visor.py` del proyecto
`reporte_diario`, a partir del corte del SUAC:

    python3 visor.py podas --corte 2026-07-29

## Datos personales

Los textos de los reportes pasan por un filtro que elimina teléfonos, correos,
CURP y el nombre del solicitante antes de publicarse: los vecinos a veces
escriben sus datos de contacto dentro del propio reporte. Auditar antes de
publicar un corte nuevo.

Publicado con `noindex` y `robots.txt` para que no aparezca en buscadores.
**No hay contraseña**: cualquiera con la dirección entra. Para acceso por
usuario, mover el DNS a Cloudflare y activar Access (gratis hasta 50 usuarios).
