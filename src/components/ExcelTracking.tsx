import React, { useEffect, useState } from 'react';

// Seguimiento de paquetes: el botón ACTUALIZAR WEB del Excel guarda los datos (sin importes) en
// Firestore, en seguimiento/publico, como texto JSON en el campo "json". Las reglas dejan leerlo a todos.
const DATA_URL = 'https://firestore.googleapis.com/v1/projects/bodipo-business-1d955/databases/(default)/documents/seguimiento/publico';

const PUNTOS: Record<string, string> = {
  Malabo: 'Malabo · Atepa, por la tarde',
  Bata: 'Bata · Cruce de Mbangan',
};

interface Paquete {
  cod: string;
  nombre: string;
  destino: string;
  kg?: string;
  envio: string;
  pasos: (string | null)[];
  pagar?: boolean;
  pagado?: boolean;
  factura?: string;
}

interface Cuenta { iban?: string; titular?: string }

// Datos de ejemplo mientras no se puede leer datos.json.
const EJEMPLO: Record<string, Paquete> = {
  M1310K7Q: { cod: 'M-1310-K7Q', nombre: 'María N.', destino: 'Malabo', kg: '12,5', envio: 'ENV/13/10/2026', pasos: ['10/10/2026', '13/10/2026', '20/10/2026', null, '22/10/2026', null] },
  B1310P4D: { cod: 'B-1310-P4D', nombre: 'Santiago A.', destino: 'Bata', kg: '31', envio: 'ENV/13/10/2026', pasos: ['11/10/2026', '13/10/2026', '20/10/2026', null, null, null] },
  M1310H2T: { cod: 'M-1310-H2T', nombre: 'Carlos B.', destino: 'Malabo', kg: '8,2', envio: 'ENV/13/10/2026', pasos: ['09/10/2026', '13/10/2026', '20/10/2026', null, '21/10/2026', '23/10/2026'], pagado: true },
  B1310R9C: { cod: 'B-1310-R9C', nombre: 'Lucía E.', destino: 'Bata', kg: '6', envio: 'ENV/13/10/2026', pasos: ['10/10/2026', '13/10/2026', '20/10/2026', '22/10/2026', null, null], pagar: true, factura: 'BB-012' },
};

// Todo viaja junto hasta Malabo y allí se clasifica; lo de Bata tiene un tramo más.
function etapas(e: Paquete) {
  const bata = e.destino === 'Bata';
  const lista = [
    { i: 0, t: 'Paquete registrado', p: 'Registrado, pesado y verificado en nuestra oficina de Alcalá de Henares' },
    { i: 1, t: 'Salida de España', p: 'Va en avión a Guinea Ecuatorial con Ethiopian Airlines' },
    { i: 2, t: bata ? 'Clasificado en Malabo' : 'Llegado a Malabo', p: bata ? 'Ha llegado a Malabo y está preparado para seguir hacia Bata' : 'En despacho y clasificación. Te avisamos en cuanto esté listo para recoger' },
  ];
  if (bata) lista.push({ i: 3, t: 'En camino a Bata', p: 'Sale de Malabo hacia nuestra oficina de Bata' });
  lista.push({ i: 4, t: 'Listo para recoger', p: PUNTOS[e.destino] || '' });
  lista.push({ i: 5, t: 'Entregado', p: 'Recogido por el cliente' });
  return lista;
}

// Una etapa no puede ir después de la siguiente: si en el Excel se apuntó más tarde
// (p. ej. registrado el 28 pero salió el 27), se muestra la fecha de la siguiente.
const aDia = (f: string | null) => {
  const m = f ? /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(f) : null;
  return m ? Number(m[3] + m[2] + m[1]) : null;
};
function ordenarFechas(pasos: (string | null)[]) {
  const res = [...pasos];
  let siguiente: string | null = null;
  for (let k = res.length - 1; k >= 0; k--) {
    const dia = aDia(res[k]);
    if (dia === null) continue;
    const diaSig = aDia(siguiente);
    if (diaSig !== null && dia > diaSig) res[k] = siguiente;
    siguiente = res[k];
  }
  return res;
}

export const limpiarCodigo = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, '');

const Copiar: React.FC<{ etiqueta: string; valor: string }> = ({ etiqueta, valor }) => {
  const [hecho, setHecho] = useState(false);
  const copiar = () => {
    navigator.clipboard?.writeText(valor).then(() => { setHecho(true); setTimeout(() => setHecho(false), 1600); }, () => {});
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e6dfd2] py-2 first:border-t-0">
      <dt className="text-[11px] font-black uppercase tracking-wider text-[#48625f]">{etiqueta}</dt>
      <dd className="flex items-center gap-3 font-mono text-sm font-bold">
        <span className="break-all">{valor}</span>
        <button type="button" onClick={copiar} className="shrink-0 border border-[#007e85] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#007e85] hover:bg-[#007e85] hover:text-white">
          {hecho ? 'Copiado' : 'Copiar'}
        </button>
      </dd>
    </div>
  );
};

const Ficha: React.FC<{ e: Paquete; cuenta: Cuenta }> = ({ e, cuenta }) => {
  const ets = etapas(e);
  let n = 0;
  ets.forEach((s, k) => { if (e.pasos[s.i]) n = k + 1; });
  const ultima = n ? ets[n - 1] : null;
  const listo = ultima?.i === 4;
  const fin = ultima?.i === 5;
  const estado = fin ? 'Entregado' : listo ? 'Listo para recoger' : ultima ? ultima.t : 'Registrado';
  const colorEstado = fin ? 'bg-[#2E9E3E] text-white' : listo ? 'bg-[#ffbd59] text-[#06272b]' : 'bg-[#007e85] text-white';
  const concepto = (e.factura ? `FACTURA ${e.factura} ` : '') + e.cod;

  return (
    <article className="grid gap-8 bg-white p-6 shadow-[0_20px_60px_rgba(6,39,43,.08)] sm:p-10 lg:grid-cols-[.9fr_1.1fr]">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-2xl font-black tracking-wide sm:text-3xl">{e.cod}</p>
            <p className="mt-1 text-[#5d716e]">{e.nombre}</p>
          </div>
          <span className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider ${colorEstado}`}>{estado}</span>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-[#e6dfd2] py-5 sm:grid-cols-3">
          <div><dt className="text-[11px] font-black uppercase tracking-wider text-[#48625f]">Ruta</dt><dd className="mt-1 font-bold">España → {e.destino}</dd></div>
          {e.kg && <div><dt className="text-[11px] font-black uppercase tracking-wider text-[#48625f]">Peso</dt><dd className="mt-1 font-bold">{e.kg} kg</dd></div>}
          <div><dt className="text-[11px] font-black uppercase tracking-wider text-[#48625f]">Envío</dt><dd className="mt-1 font-bold">{e.envio}</dd></div>
        </dl>
        {listo && (
          <div className="mt-6 border-l-4 border-[#ffbd59] bg-[#fff6e6] p-4">
            <p className="font-black">Ya puedes recogerlo</p>
            <p className="mt-1 text-sm text-[#48625f]">{PUNTOS[e.destino]}. Recógelo dentro del plazo indicado en el aviso; después se cobra almacenamiento por día. Para retirarlo, el pago debe estar completo. Trae tu código o tu factura.</p>
          </div>
        )}
        {e.pagado ? (
          <div className="mt-6 border-l-4 border-[#2E9E3E] bg-[#eef8ef] p-4">
            <p className="font-black">Pago completado</p>
            <p className="mt-1 text-sm text-[#48625f]">Hemos recibido tu pago. ¡Gracias por confiar en Bodipo Business!</p>
          </div>
        ) : e.pagar ? (
          <div className="mt-6 border-l-4 border-[#E01E25] bg-[#fdf0f0] p-4">
            <p className="font-black">Tienes un pago pendiente</p>
            <p className="mt-1 text-sm text-[#48625f]">Págalo por transferencia con estos datos y pon este concepto. El justificante te lo da tu banco.</p>
            {cuenta.iban && (
              <dl className="mt-3 bg-white px-3">
                <Copiar etiqueta="IBAN" valor={cuenta.iban} />
                {cuenta.titular && <Copiar etiqueta="Titular" valor={cuenta.titular} />}
                <Copiar etiqueta="Concepto" valor={concepto} />
              </dl>
            )}
          </div>
        ) : null}
      </div>

      <ol className="relative">
        {ets.map((s, k) => {
          const hecho = k < n - 1 || (k === n - 1 && s.i === 5);
          const actual = k === n - 1 && !hecho;
          const fecha = e.pasos[s.i];
          const icono = hecho ? '✓' : s.i === 1 || s.i === 3 ? '✈' : String(k + 1);
          const punto = hecho ? 'bg-[#007e85] text-white border-[#007e85]' : actual ? 'bg-[#ffbd59] text-[#06272b] border-[#ffbd59]' : 'bg-white text-[#93a5a2] border-[#cfc8bc]';
          return (
            <li key={s.i} className="relative flex gap-4 pb-6 last:pb-0">
              {k < ets.length - 1 && <span className={`absolute left-[17px] top-9 h-[calc(100%-36px)] w-0.5 ${k < n - 1 ? 'bg-[#007e85]' : 'bg-[#e6dfd2]'}`} aria-hidden="true" />}
              <span className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black ${punto}`} aria-hidden="true">{icono}</span>
              <div className={k >= n ? 'opacity-60' : ''}>
                <h3 className="font-black">{s.t}</h3>
                <p className="mt-0.5 text-sm text-[#5d716e]">
                  {fecha ? <><time className="font-bold text-[#06272b]">{fecha}</time> · </> : k === n ? 'Próximo paso · ' : ''}
                  {s.p}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
};

interface Props { codigo: string }

const ExcelTracking: React.FC<Props> = ({ codigo }) => {
  const [paquetes, setPaquetes] = useState<Record<string, Paquete>>(EJEMPLO);
  const [cuenta, setCuenta] = useState<Cuenta>({});
  const [actualizado, setActualizado] = useState('');
  const [ejemplo, setEjemplo] = useState(true);

  useEffect(() => {
    fetch(DATA_URL, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => {
        const texto = doc?.fields?.json?.stringValue;
        const d = texto ? JSON.parse(texto) : null;
        if (!d || !d.paquetes) return;
        const lista: Record<string, Paquete> = {};
        Object.entries(d.paquetes as Record<string, Paquete>).forEach(([k, p]) => {
          lista[k] = { ...p, pasos: ordenarFechas(p.pasos || []) };
        });
        setPaquetes(lista);
        setCuenta(d.cuenta || {});
        setActualizado(d.actualizado || '');
        setEjemplo(false);
      })
      .catch(() => {});
  }, []);

  if (!codigo) return null;
  const e = paquetes[limpiarCodigo(codigo)];

  return (
    <div>
      {ejemplo && (
        <p className="mb-4 text-xs font-bold text-[#8a6d2f]">Vista de ejemplo: prueba con M-1310-K7Q, B-1310-P4D, M-1310-H2T o B-1310-R9C.</p>
      )}
      {e ? <Ficha e={e} cuenta={cuenta} /> : (
        <div className="bg-white p-8 shadow-[0_20px_60px_rgba(6,39,43,.08)]">
          <h3 className="text-xl font-black">No encontramos ese código</h3>
          <p className="mt-2 text-[#5d716e]">Revisa que esté igual que en tu factura (por ejemplo M-1310-K7Q). Si sigue sin salir, escríbenos por WhatsApp al +34 641 992 110.</p>
        </div>
      )}
      {actualizado && <p className="mt-4 text-xs text-[#5d716e]">Actualizado el {actualizado}.</p>}
    </div>
  );
};

export default ExcelTracking;
