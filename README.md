# NAS/CALC

Calculadora visual de capacidad para elegir sistema NAS y reparto de discos. Muestra cuánto espacio queda realmente disponible, cuánto se reserva la protección y cuánto se desperdicia, con un chasis interactivo de bahías.

## Qué incluye

- **Seis ecosistemas**: Synology DSM (SHR/SHR-2), TrueNAS SCALE (ZFS), Unraid, OpenMediaVault (mdadm y SnapRAID), fnOS (Btrfs) y QNAP QuTS hero (ZFS).
- **Chasis interactivo**: elige el número de bahías, coloca discos con un clic o arrastrando, cámbialos de tamaño y vacía el chasis.
- **Test de fallo**: apaga discos para comprobar si el volumen sobrevive según su tolerancia real.
- **Resultado desglosado**: disponible, protección, reservado por el sistema/filesystem y espacio sin usar.
- **Comparativa doble**:
  - todos los repartos del sistema elegido con los mismos discos;
  - el mismo chasis en los seis sistemas usando la configuración recomendada de cada uno.
- **Backup aparte**: calcula el destino externo mínimo para una copia completa y recuerda la regla 3-2-1.
- **Unidades**: TiB reales (por defecto) o TB de etiqueta.
- **Método transparente**: tabla de reservas por sistema y preguntas frecuentes.

## Arrancar

Requiere Node 20.19+ (probado con Node 20.19.2).

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

```bash
npm run build      # build de producción en dist/
npm run preview    # sirve el build
npm run typecheck  # TypeScript estricto
npm test           # tests del motor de cálculo
```

## Desplegar

El build es completamente estático y usa rutas relativas (`base: './'`). El mismo contenido de `dist/` funciona tanto en la raíz de un dominio como en una subcarpeta de GitHub Pages.

### Vercel

No hace falta configuración adicional:

1. Sube el repositorio a GitHub, GitLab o Bitbucket.
2. En Vercel, importa el proyecto y deja que detecte Vite.
3. Usa `npm run build` como build command y `dist` como output directory.
4. Despliega.

También se puede publicar desde terminal:

```bash
npx vercel
npx vercel --prod
```

### GitHub Pages

El proyecto ya incluye el workflow `.github/workflows/deploy.yml`, que ejecuta typecheck, tests y build antes de publicar.

1. Sube el repositorio con el nombre `NASCalc`.
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Haz push a `main` o lanza el workflow manualmente desde **Actions**.
4. La web quedará en `https://TU_USUARIO.github.io/NASCalc/`.

Si tu rama principal se llama `master`, cambia `branches: [main]` en el workflow. En repos gratuitos, GitHub Pages requiere que el repositorio sea público.

## Cómo calcula

La capacidad se trabaja internamente en **TB decimales** (`1 TB = 1.000 GB`) y se convierte a **TiB** (`1 TiB = 1.024 GiB`) para mostrarla. Así se explica la diferencia entre la etiqueta del disco y lo que enseña el sistema operativo.

| Reparto | Capacidad útil | Protección |
| --- | --- | --- |
| RAID 5 / 6 / RAIDZ1-3 | `(n - paridad) × disco más pequeño` | `paridad × disco más pequeño` |
| Espejo / RAID 10 | suma de la mitad pequeña de cada pareja | la otra mitad |
| SHR / SHR-2 | por capas de capacidad, con 1 o 2 discos de paridad por capa | discos de paridad de cada capa |
| Unraid / SnapRAID | suma de los discos de datos | discos más grandes dedicados a paridad |

Después se aplican las reservas estimadas de cada plataforma:

| Sistema | Filesystem | Reserva del sistema | Ajuste |
| --- | --- | --- | --- |
| Synology | Btrfs | 10 GB por disco (DSM) | 4% + 10 GB/disco |
| TrueNAS | ZFS | disco de arranque aparte | 3,2% |
| Unraid | XFS | USB de arranque | 1% |
| OpenMediaVault | ext4 | otro disco | 2% |
| fnOS | Btrfs | 5 GB por disco | 4% + 5 GB/disco |
| QNAP QuTS hero | ZFS | otro disco | 3,2% |

Los cálculos son **orientativos**: snapshots, deduplicación, compresión, tamaño de bloque, fragmentación, hot spare y cachés pueden cambiar el resultado. La paridad protege ante un fallo de disco, no ante borrados, ransomware ni robos: el backup es obligatorio.

## Estructura

```
src/
  components/        UI: chasis, paleta, resultado, comparativas, método
  data/systems.ts    sistemas, esquemas, paletas y reservas
  lib/calc.ts        motor de cálculo y recomendaciones
  lib/capacity.ts    conversión y formato de unidades
  lib/calc.test.ts   17 tests de fórmulas y casos límite
  styles.css         diseño responsive y tokens visuales
public/              favicon y .nojekyll
.github/workflows/   despliegue automático a GitHub Pages
```

Hecho con React 19, Vite 8, TypeScript 7 y CSS propio. Tipografías Space Grotesk y JetBrains Mono autoalojadas con Fontsource.

## Aviso

Herramienta independiente, sin afiliación con Synology, TrueNAS, Unraid, OpenMediaVault, fnOS ni QNAP. Las marcas pertenecen a sus titulares.
