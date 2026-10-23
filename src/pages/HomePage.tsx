import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import ExcelTracking from '../components/ExcelTracking';
import { AGENCIAS, EMAIL, HORARIO, PUNTOS_RECOGIDA, enlaceTelefono, enlaceWhatsApp } from '../constants/empresa';

interface HomePageProps {
  onOpenRegister: () => void;
  onOpenContact: () => void;
  onOpenAbout: () => void;
}

const operations = [
  { number: '01', title: 'Próximas salidas', text: 'Planifica con fechas, rutas y disponibilidad actualizadas.', to: '/calendario', action: 'Ver calendario' },
  { number: '02', title: 'Compras online', text: 'Recibe tus compras internacionales con acompañamiento local.', to: '/compras-online', action: 'Empezar a comprar' },
  { number: '03', title: 'Money Transfer', text: 'Transferencias claras, seguras y pensadas para tu día a día.', to: '/money-transfer', action: 'Enviar dinero' },
  { number: '04', title: 'Tienda Bodipo', text: 'Una selección de productos y oportunidades para nuestra comunidad.', to: '/tienda', action: 'Visitar tienda' },
];

const servicios = [
  { titulo: 'Transporte aéreo', texto: 'Vuelos regulares con Ethiopian Airlines según el calendario de envíos, a Malabo y a Bata.', puntos: ['Paquetería y carga desde 1 kg', 'Salidas programadas y avisadas con antelación'], icono: 'M2 16l20-6-20-6 3 6-3 6Zm3-6h8' },
  { titulo: 'Recogida y almacén en España', texto: 'Recibimos tu mercancía en Alcalá de Henares o la recogemos en tu domicilio.', puntos: ['Recogida a domicilio la semana antes del envío (los jueves no)', 'Cada paquete se registra, se pesa y se verifica'], icono: 'M3 7h11v10H3zM14 10h4l3 3v4h-7M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' },
  { titulo: 'Despacho y custodia en Guinea', texto: 'Gestionamos el despacho a la llegada y guardamos tu paquete en espacios seguros hasta la entrega.', puntos: ['Entrega en nuestras oficinas de Malabo y Bata', 'Aviso por WhatsApp cuando está listo'], icono: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Zm-3 9 2 2 4-4' },
  { titulo: 'Seguimiento de cada paquete', texto: 'Cada paquete tiene su código. Con él ves en esta web en qué punto está, sin tener que preguntar.', puntos: ['Recibido, salida, llegada, listo y entregado', 'El código va en tu factura y en tu WhatsApp'], icono: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-3.5-3.5' },
];

const pasos = [
  { titulo: 'Prepáralo', texto: 'Trae tus cosas ya metidas en cajas y etiquetadas. Si no tienes caja, puedes comprar una al dejar el paquete.' },
  { titulo: 'Entrégalo y confirma', texto: 'Dinos el destino (Malabo o Bata) y dónde pagarás (España o Guinea). Una vez iniciado el envío no se pueden cambiar.' },
  { titulo: 'Sigue tu envío', texto: 'Te mandamos tu código de seguimiento por WhatsApp. Si tienes dudas con el peso o el contenido, avísanos como máximo al día siguiente.' },
  { titulo: 'Recógelo', texto: 'Te avisamos cuando esté listo. Recógelo dentro del plazo del aviso y con el pago completado; después se cobra almacenamiento por día.' },
];

const Arrow = () => (
  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 10h13m-5-5 5 5-5 5" />
  </svg>
);

const HomePage: React.FC<HomePageProps> = ({ onOpenRegister, onOpenContact, onOpenAbout }) => {
  const { isAuthenticated } = useAuth();
  // El enlace del WhatsApp llega como ?c=M1310K7Q y abre la portada ya en ese paquete.
  const codigoUrl = new URLSearchParams(window.location.search).get('c') || '';
  const [trackingId, setTrackingId] = useState(codigoUrl.toUpperCase());
  const [codigoBuscado, setCodigoBuscado] = useState(codigoUrl);
  const resultado = useRef<HTMLElement>(null);
  const heroImage = '/images/bodipo-malabo-delivery-hero.jpg';

  const submitTracking = (event: React.FormEvent) => {
    event.preventDefault();
    setCodigoBuscado(trackingId.trim());
    setTimeout(() => resultado.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  useEffect(() => {
    if (codigoUrl) resultado.current?.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <main className="overflow-hidden bg-[#F3F6F7] text-[#0E2A3B]">
      <section className="relative isolate min-h-[620px] bg-[#06272b]">
        <div className="absolute inset-0 overflow-hidden">
          <img src={heroImage} alt="Equipo de logística de Bodipo Business" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06272b]/95 via-[#06272b]/76 to-[#06272b]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06272b]/55 via-transparent to-[#06272b]/10" />
        </div>
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full border border-teal-300/10" />
        <div className="absolute -left-8 top-40 h-44 w-44 rounded-full border border-teal-300/10" />

        <div className="relative grid min-h-[620px] w-full content-center gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[.52fr_.48fr] lg:px-16 xl:px-24">
          <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7 }} className="relative z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-4 text-xs font-black uppercase tracking-[.24em] text-[#ffbd59]">
              <span className="h-px w-12 bg-[#ffbd59]" />
              Desde Guinea Ecuatorial al mundo
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-[.98] tracking-[-.045em] text-white sm:text-5xl lg:text-6xl">
              Movemos oportunidades.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#c8dad7]">
              Servicios logísticos integrales, envíos aéreos y soluciones empresariales adaptadas a tus necesidades.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/tarifas" className="group inline-flex items-center gap-3 bg-[#ffbd59] px-6 py-3.5 text-xs font-black uppercase tracking-[.13em] text-[#06272b] transition hover:bg-white">
                Calcular un envío <Arrow />
              </Link>
              <button onClick={onOpenContact} className="group inline-flex items-center gap-3 border border-white/30 px-6 py-3.5 text-xs font-black uppercase tracking-[.13em] text-white transition hover:border-white hover:bg-white hover:text-[#06272b]">
                Hablar con Bodipo <Arrow />
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .15 }} className="relative z-20 max-w-[520px] lg:col-start-1 lg:row-start-2 lg:w-full">
            <div className="border border-white/15 bg-[#f5f1e8] p-5 shadow-[0_20px_60px_rgba(0,0,0,.25)] sm:p-6">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.25em] text-[#007e85]">Centro de seguimiento</p>
                  <h2 className="mt-1 text-xl font-black tracking-tight">¿Dónde está tu envío?</h2>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#06272b] text-[#ffbd59]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg>
                </span>
              </div>
              <form onSubmit={submitTracking} className="mt-4">
                <label htmlFor="home-tracking" className="text-xs font-bold text-[#48625f]">Introduce tu número de seguimiento</label>
                <div className="mt-3 border-b-2 border-[#06272b]">
                  <input id="home-tracking" value={trackingId} onChange={(event) => setTrackingId(event.target.value.toUpperCase())} placeholder="Ej. M-1310-K7Q" className="w-full bg-transparent py-2 font-mono text-base font-bold uppercase outline-none placeholder:text-[#93a5a2]" />
                </div>
                <button type="submit" className="group mt-4 flex w-full items-center justify-between bg-[#007e85] px-5 py-3 text-xs font-black uppercase tracking-[.14em] text-white transition hover:bg-[#06272b]">
                  Consultar recorrido <Arrow />
                </button>
              </form>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#d8d3c9] pt-4 text-xs">
                <Link to="/tarifas" className="group font-black uppercase tracking-wider text-[#48625f] hover:text-[#007e85]">Tarifas <span aria-hidden="true">↗</span></Link>
                <Link to="/calendario" className="group text-right font-black uppercase tracking-wider text-[#48625f] hover:text-[#007e85]">Salidas <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {codigoBuscado && (
        <section ref={resultado} id="seguimiento" className="scroll-mt-24 border-b border-[#d9d2c7] px-5 py-14 sm:px-8 lg:px-16 xl:px-24">
          <p className="text-xs font-black uppercase tracking-[.24em] text-[#007e85]">Centro de seguimiento</p>
          <h2 className="mb-8 mt-3 text-3xl font-black tracking-tight sm:text-4xl">Así va tu envío</h2>
          <ExcelTracking codigo={codigoBuscado} />
        </section>
      )}

      <section id="servicios" className="w-full px-5 pb-16 pt-24 sm:px-8 lg:px-16 lg:pt-20 xl:px-24">
        <p className="text-xs font-black uppercase tracking-[.24em] text-[#1E5A5E]">Nuestra logística</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold uppercase leading-none text-[#0E2A3B] sm:text-5xl">Nos ocupamos de toda la cadena</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#55707C]">Desde que recogemos tu paquete en España hasta que lo retiras en Guinea Ecuatorial.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {servicios.map((s) => (
            <article key={s.titulo} className="flex flex-col border-t-4 border-[#2E9E3E] bg-white p-6 shadow-[0_10px_30px_rgba(14,42,59,.08)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E1EEEE] text-[#1E5A5E]">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={s.icono} /></svg>
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold uppercase leading-tight text-[#0E2A3B]">{s.titulo}</h3>
              <p className="mt-3 leading-relaxed text-[#55707C]">{s.texto}</p>
              <ul className="mt-4 flex flex-col gap-2 border-t border-[#D5E0E3] pt-4 text-sm text-[#0E2A3B]">
                {s.puntos.map((p) => (
                  <li key={p} className="flex gap-2"><span className="mt-0.5 text-[#2E9E3E]" aria-hidden="true">✓</span>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="como-enviar" className="bg-[#0E2A3B] text-white">
        <div className="grid w-full gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_.7fr] lg:px-16 lg:py-20 xl:px-24">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-[#7FD08A]">Paso a paso</p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none sm:text-5xl">Cómo enviar tu paquete</h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2">
              {pasos.map((p, i) => (
                <li key={p.titulo} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2E9E3E] font-display text-xl font-bold">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase">{p.titulo}</h3>
                    <p className="mt-1.5 leading-relaxed text-[#A9C3CB]">{p.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="self-start border-2 border-dashed border-white/40 p-6">
            <p className="font-display text-lg font-bold uppercase tracking-[.06em] text-[#7FD08A]">Así debe ir identificado cada paquete</p>
            <dl className="mt-5 flex flex-col gap-3 font-mono text-sm">
              <div className="flex justify-between gap-4 border-b border-white/15 pb-2"><dt className="text-[#A9C3CB]">Destinatario</dt><dd>Nombre y apellidos</dd></div>
              <div className="flex justify-between gap-4 border-b border-white/15 pb-2"><dt className="text-[#A9C3CB]">Teléfono</dt><dd>+240 ··· ··· ···</dd></div>
              <div className="flex justify-between gap-4 border-b border-white/15 pb-2"><dt className="text-[#A9C3CB]">Destino</dt><dd>MALABO / BATA</dd></div>
            </dl>
            <p className="mt-5 bg-white py-2 text-center font-display text-xl font-bold tracking-[.08em] text-[#0E2A3B]">BODIPO BUSINESS</p>
            <p className="mt-4 text-sm text-[#A9C3CB]">Un paquete sin identificar no es responsabilidad de la agencia hasta que se identifique, y puede retrasarse.</p>
          </div>
        </div>
      </section>

      <section id="contacto" className="w-full px-5 py-16 sm:px-8 lg:px-16 lg:py-20 xl:px-24">
        <p className="text-xs font-black uppercase tracking-[.24em] text-[#1E5A5E]">Contacto y agencias</p>
        <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none text-[#0E2A3B] sm:text-5xl">Estamos cerca de ti</h2>
        <p className="mt-4 max-w-2xl text-lg text-[#55707C]">{HORARIO}. En tu primer mensaje dinos tu nombre y qué servicio necesitas.</p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {AGENCIAS.map((a) => (
            <article key={a.pais} className="flex flex-col bg-white p-6 shadow-[0_10px_30px_rgba(14,42,59,.08)]">
              <div className="flex items-center gap-3">
                {a.bandera ? <img src={a.bandera} alt="" className="h-6 w-9 rounded-[3px] object-cover" /> : <span className="text-2xl" aria-hidden="true">🇨🇲</span>}
                <h3 className="font-display text-2xl font-bold uppercase text-[#0E2A3B]">{a.pais}</h3>
              </div>
              <p className="mt-3 text-[#55707C]">{a.direccion}<br />{a.ciudad}</p>
              <a href={enlaceTelefono(a.telefono)} className="mt-4 font-mono text-lg font-bold text-[#0E2A3B] hover:text-[#1E5A5E]">{a.telefono}</a>
              <div className="mt-5 flex gap-2">
                <a href={enlaceWhatsApp(a.telefono)} target="_blank" rel="noreferrer" className="flex-1 bg-[#2E9E3E] py-2.5 text-center text-xs font-black uppercase tracking-wider text-white hover:bg-[#0E2A3B]">WhatsApp</a>
                <a href={enlaceTelefono(a.telefono)} className="flex-1 border border-[#0E2A3B] py-2.5 text-center text-xs font-black uppercase tracking-wider text-[#0E2A3B] hover:bg-[#0E2A3B] hover:text-white">Llamar</a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_2fr]">
          <a href={`mailto:${EMAIL}`} className="flex items-center gap-4 bg-[#1E5A5E] p-6 text-white hover:bg-[#0E2A3B]">
            <svg className="h-8 w-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            <span><span className="block text-xs font-black uppercase tracking-[.2em] text-[#A9C3CB]">Correo electrónico</span><span className="text-lg font-bold">{EMAIL}</span></span>
          </a>
          <div className="bg-white p-6 shadow-[0_10px_30px_rgba(14,42,59,.08)]">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#1E5A5E]">Puntos de recogida</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {PUNTOS_RECOGIDA.map((p) => (
                <li key={p.lugar}><span className="block font-display text-lg font-bold uppercase text-[#0E2A3B]">{p.lugar}</span><span className="text-sm text-[#55707C]">{p.detalle}</span></li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[#55707C]">Las fechas de recogida en Guinea dependen del despacho de cada aerolínea. Te las confirmamos por WhatsApp.</p>
          </div>
        </div>
      </section>

      <section className="relative w-full px-5 pb-24 pt-24 sm:px-8 lg:px-16 lg:pt-16 xl:px-24">
        <div className="grid gap-10 border-b border-[#cfc8bc] pb-14 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-[#007e85]">Además, te ayudamos con</p>
            <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-none text-[#0E2A3B] sm:text-5xl">Más servicios Bodipo</h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-[#48625f] lg:ml-auto">
            Hemos reunido las operaciones que más utilizas para que puedas pasar de planificar a actuar sin perder tiempo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2">
          {operations.map((operation, index) => (
            <motion.div key={operation.number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ delay: index * .08 }}>
              <Link to={operation.to} className={`group block min-h-[280px] border-[#cfc8bc] py-10 transition hover:bg-white/70 lg:p-12 ${index % 2 === 0 ? 'lg:border-r' : ''} ${index < 2 ? 'border-b' : ''}`}>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm font-bold text-[#007e85]">{operation.number}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8ba09d] transition group-hover:border-[#007e85] group-hover:bg-[#007e85] group-hover:text-white"><Arrow /></span>
                </div>
                <h3 className="mt-12 text-2xl font-black tracking-tight sm:text-3xl">{operation.title}</h3>
                <p className="mt-4 max-w-sm leading-relaxed text-[#5d716e]">{operation.text}</p>
                <span className="mt-8 inline-block text-[11px] font-black uppercase tracking-[.18em] text-[#007e85]">{operation.action}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#d9d2c7] bg-white">
        <div className="grid w-full gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-16 lg:py-20 xl:px-24">
          <img src="/images/malabo-ciudad.jpg" alt="Malabo, Guinea Ecuatorial" className="aspect-[16/10] w-full object-cover shadow-[0_20px_50px_rgba(14,42,59,.18)]" loading="lazy" />
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#1E5A5E]">Sobre nosotros</p>
            <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-none tracking-[.01em] text-[#0E2A3B] sm:text-5xl">Conectamos personas, mercados y oportunidades.</h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#5d716e]">
              Bodipo Business es un equipo ecuatoguineano que facilita envíos, compras y servicios financieros entre Guinea Ecuatorial, España y Camerún con atención cercana y procesos claros.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={onOpenAbout} className="border border-[#0E2A3B] px-6 py-3 text-xs font-black uppercase tracking-wider text-[#0E2A3B] transition hover:bg-[#0E2A3B] hover:text-white">Conocer al equipo</button>
              <button onClick={onOpenContact} className="bg-[#2E9E3E] px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#0E2A3B]">Contactar</button>
            </div>
          </div>
        </div>
      </section>
      {!isAuthenticated && (
      <section className="bg-[#1E5A5E] text-white">
        <div className="grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-16 xl:px-24">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-[#b9eee8]">Tu próximo paso</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">La distancia no debería limitar tus oportunidades.</h2>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button onClick={onOpenRegister} className="bg-[#2E9E3E] px-6 py-3.5 text-xs font-black uppercase tracking-[.14em] text-white transition hover:bg-white hover:text-[#0E2A3B]">Crear una cuenta</button>
            <button onClick={onOpenContact} className="border border-white/40 px-6 py-3.5 text-xs font-black uppercase tracking-[.14em] transition hover:bg-white hover:text-[#06272b]">Contactar</button>
          </div>
        </div>
      </section>
      )}
    </main>
  );
};

export default HomePage;