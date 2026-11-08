import {
  ChevronDown,
  Database,
  HardDrive,
  Layers,
  ShieldCheck,
} from 'lucide-react'
import { SYSTEMS } from '../data/systems'
import { StepLabel } from './ui'

const FAQ = [
  {
    question: '¿Qué diferencia hay entre SHR y RAID 5?',
    answer:
      'Con discos del mismo tamaño reparten casi igual. SHR trabaja por capas, así que aprovecha mejor los discos mixtos y facilita ampliar con unidades mayores. RAID 5 es el estándar clásico y te resultará más familiar si algún día migras a otro sistema.',
  },
  {
    question: '¿Por qué aparece espacio sin usar?',
    answer:
      'RAID 5/6 y RAIDZ usan el tamaño del disco más pequeño de cada grupo: si mezclas 8 TB y 4 TB, los 8 TB se comportan como 4 TB. También queda fuera el disco impar de un espejo, las capas de SHR-2 que no reúnen discos suficientes y las bahías vacías. La zona gris es capacidad real que ese reparto no puede usar.',
  },
  {
    question: '¿La protección de un disco es un backup?',
    answer:
      'No. La paridad o el espejo reconstruyen el volumen si un disco falla, pero no te salvan de borrar un archivo, de un ransomware, de un incendio o de un rayo. Necesitas al menos una copia en otro medio y, idealmente, otra fuera de casa. La tarjeta de backup te da el tamaño mínimo del destino.',
  },
  {
    question: '¿Puedo añadir o cambiar discos más adelante?',
    answer:
      'En SHR, Unraid y SnapRAID sí: añades o sustituyes discos y el sistema reequilibra. En ZFS necesitas añadir un vdev completo con la misma geometría; no basta con cambiar un disco por otro mayor. En mdadm se puede crecer un RAID 5, pero conviene hacer copia antes.',
  },
  {
    question: '¿Los resultados son exactos?',
    answer:
      'Son estimaciones de planificación basadas en la documentación pública de cada sistema. El espacio libre final depende de la versión, el filesystem, el tamaño de bloque, los snapshots, la deduplicación y la fragmentación. Para una compra, contrasta el modelo concreto y su número máximo de discos por volumen.',
  },
  {
    question: '¿Por qué no elijo un modelo de NAS concreto?',
    answer:
      'Porque lo que cambia el resultado es el sistema operativo y cómo reparte los discos, no la carcasa. Tú defines las bahías y los tamaños; la calculadora aplica las reglas de cada plataforma. Comprueba en la ficha del modelo los límites de volumen y de capacidad.',
  },
]

export function MethodSection() {
  return (
    <section className="section shell method" id="metodo" aria-labelledby="metodo-title">
      <div className="section-head">
        <StepLabel number="06">Método</StepLabel>
        <div className="section-head__row">
          <h2 id="metodo-title">
            Números honestos.
            <br />
            <span>Suposiciones claras.</span>
          </h2>
          <p className="section-head__intro">
            No todos los TB son iguales y ningún RAID regala capacidad. Esto es lo que hay detrás
            de cada barra, para que puedas comparar manzanas con manzanas.
          </p>
        </div>
      </div>

      <div className="method-grid">
        <article className="method-card">
          <span className="method-card__icon"><Database size={19} /></span>
          <span className="method-card__num">01</span>
          <h3>TB no es TiB</h3>
          <p>
            Los discos se venden en TB decimales (1 TB = 1.000 GB). El sistema operativo muestra
            TiB (1 TiB = 1.024 GiB). Por eso un disco de 8 TB aparece como 7,28 TiB. Cambia la
            unidad arriba cuando quieras ver la etiqueta de la tienda.
          </p>
        </article>
        <article className="method-card">
          <span className="method-card__icon"><Layers size={19} /></span>
          <span className="method-card__num">02</span>
          <h3>Discos mixtos</h3>
          <p>
            En RAID clásico manda el disco más pequeño. SHR, Unraid y SnapRAID trabajan por capas
            o por discos completos, así que aprovechan mejor la mezcla. La zona gris es capacidad
            que el reparto elegido no puede usar.
          </p>
        </article>
        <article className="method-card">
          <span className="method-card__icon"><HardDrive size={19} /></span>
          <span className="method-card__num">03</span>
          <h3>Reservas del sistema</h3>
          <p>
            Cada plataforma aparta espacio para arrancar y para metadatos. Aplicamos una reserva
            por disco y un porcentaje de filesystem según el sistema. Los snapshots, la caché o la
            deduplicación pueden cambiar el espacio libre final.
          </p>
        </article>
        <article className="method-card">
          <span className="method-card__icon"><ShieldCheck size={19} /></span>
          <span className="method-card__num">04</span>
          <h3>Paridad ≠ backup</h3>
          <p>
            La tolerancia a fallos se mide en discos que puedes perder sin apagar el volumen. Un
            RAID 6 tolera dos fallos, pero no un borrado. Planifica siempre una copia externa: la
            tarjeta de backup calcula el destino mínimo.
          </p>
        </article>
      </div>

      <div className="overhead-block">
        <div className="overhead-block__head">
          <div>
            <span className="micro-label">Suposiciones aplicadas</span>
            <h3>Lo que cada sistema se queda por el camino</h3>
          </div>
          <p>
            Estimaciones de planificación. La capacidad real puede variar con la versión, el
            filesystem y los snapshots.
          </p>
        </div>
        <div className="table-scroll">
          <table className="overhead-table">
            <thead>
              <tr>
                <th scope="col">Sistema</th>
                <th scope="col">Filesystem</th>
                <th scope="col">Reserva del sistema</th>
                <th scope="col">Ajuste aplicado</th>
              </tr>
            </thead>
            <tbody>
              {SYSTEMS.map((system) => (
                <tr key={system.id}>
                  <th scope="row">{system.name}</th>
                  <td>{system.overhead.fsLabel}</td>
                  <td>
                    {system.overhead.systemPerDiskGB > 0
                      ? `${system.overhead.systemPerDiskGB} GB por disco`
                      : 'Disco de arranque aparte'}
                  </td>
                  <td className="mono">
                    {system.overhead.fsPct}% +{' '}
                    {system.overhead.systemPerDiskGB > 0
                      ? `${system.overhead.systemPerDiskGB} GB/disco`
                      : '0 GB'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="faq" aria-labelledby="faq-title">
        <div className="faq__intro">
          <span className="micro-label">Antes de comprar</span>
          <h3 id="faq-title">Preguntas que sí importan</h3>
          <p>
            Las dudas que aparecen cuando pasas de la ficha del producto a la vida real.
          </p>
        </div>
        <div className="faq__list">
          {FAQ.map((item) => (
            <details key={item.question}>
              <summary>
                <span>{item.question}</span>
                <ChevronDown size={17} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div className="site-footer__brand">
          <span className="brand__name">
            NAS<span>/</span>CALC
          </span>
          <p>Decisiones de almacenamiento, antes de comprar.</p>
        </div>
        <nav className="site-footer__nav" aria-label="Enlaces del pie">
          <a href="#sistemas">Sistemas</a>
          <a href="#discos">Discos</a>
          <a href="#comparativa">Comparativa</a>
          <a href="#cara-a-cara">Cara a cara</a>
          <a href="#metodo">Método</a>
        </nav>
        <p className="site-footer__legal">
          Herramienta independiente. No está afiliada a Synology, TrueNAS, Unraid, OpenMediaVault,
          fnOS ni QNAP. Las marcas pertenecen a sus titulares. Cálculos orientativos: comprueba
          siempre los límites del modelo concreto.
        </p>
        <span className="site-footer__year">© 2026 NAS/CALC</span>
      </div>
    </footer>
  )
}
