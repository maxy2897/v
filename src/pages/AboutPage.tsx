import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { AppConfig } from '../../types';
import { useSettings } from '../context/SettingsContext';

interface TeamMember {
  id: string;
  name: string;
  roleKey: string;
  bioKeys: string[];
  image: string;
  email?: string;
  linkedin?: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: "D. V. Nguema Elebiyo Mangue",
    roleKey: "about.member_nguema_role",
    bioKeys: ["about.member_nguema_bio1", "about.member_nguema_bio2"],
    image: "/images/dv-nguema.jpeg",
    email: "nguemaelebiyo@gmail.com",
    linkedin: "https://www.linkedin.com/in/vistremundo-nguema-elebiyo-mangue-5149a0216/"
  },
  {
    id: '2',
    name: "D.A. MARTIN NDONG",
    roleKey: "about.member_martin_role",
    bioKeys: ["about.member_martin_bio1", "about.member_martin_bio2"],
    image: "/images/da-martin.jpg",
    email: "antoniomartinndongedo@gmail.com",
    linkedin: "https://www.linkedin.com/in/antonio-martin-ndong-edo-76223a29a"
  }
];

interface AboutPageProps {
  onOpenRegister?: () => void;
  onOpenLogin?: () => void;
  onOpenContact?: () => void;
  onOpenSettings?: () => void;
  config: AppConfig;
}

const AboutPage: React.FC<AboutPageProps> = ({ onOpenRegister, onOpenLogin, onOpenSettings, config }) => {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 selection:bg-teal-100 selection:text-teal-900 transition-colors duration-300">
      <Header 
        onOpenRegister={onOpenRegister || (() => {})} 
        onOpenLogin={onOpenLogin || (() => {})} 
        onOpenSettings={onOpenSettings || (() => {})}
        config={config} 
      />

      <main className="max-w-7xl mx-auto px-4 py-20 lg:py-32">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 mb-12 text-gray-400 hover:text-teal-600 font-bold uppercase tracking-widest text-[10px] transition-all group">
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Volver al Inicio
        </Link>

        {/* History Section */}
        <section className="mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-500 mb-4 animate-pulse">Nuestra Historia</p>
              <h1 className="text-4xl lg:text-6xl font-black text-[#00151a] dark:text-white uppercase tracking-tighter mb-8 leading-none">
                Conectando continentes con <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">excelencia logística</span>
              </h1>
              <div className="space-y-6 text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                <p>
                  Bodipo Business nació de una visión clara: eliminar las barreras logísticas que separaban a las familias y empresarios entre Europa y África Central. Lo que comenzó como un pequeño enlace estratégico en España, se ha convertido hoy en una red multinacional de confianza.
                </p>
                <p>
                  Nuestra trayectoria está marcada por el compromiso inquebrantable con la seguridad y la puntualidad. Hemos operado bajo la premisa de que cada paquete, transferencia o trámite representa los sueños y el esfuerzo de nuestros clientes.
                </p>
                <p>
                  Hoy, con sedes en España, Camerún y Guinea Ecuatorial, seguimos innovando para ofrecer soluciones premium que transforman la forma en que los negocios cruzan fronteras.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-teal-50 dark:bg-teal-900/10 overflow-hidden shadow-2xl relative z-10 p-4 border border-teal-100/20">
                 <img 
                   src="/images/hero-home.jpg" 
                   alt="Logistic Operations" 
                   className="w-full h-full object-cover rounded-[2.5rem]"
                 />
              </div>
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </motion.div>
        </section>

        {/* Team Section */}
        <section id="equipo">
          <div className="text-center mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-500 mb-4">Nuestro Equipo</p>
            <h2 className="text-3xl lg:text-5xl font-black text-[#00151a] dark:text-white uppercase tracking-tighter">Personas que hacen <span className="text-teal-400 italic">posible</span> lo imposible</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {TEAM_MEMBERS.map((member) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl mb-6 bg-gray-100 dark:bg-gray-800">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{member.name}</h3>
                    <p className="text-teal-400 text-xs font-bold uppercase tracking-widest">{t(member.roleKey)}</p>
                  </div>
                </div>
                
                <div className="space-y-4 px-2">
                  <div className="flex gap-3">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-500 transition-colors" title="LinkedIn">
                        <svg className="w-5 h-5 font-black uppercase tracking-[0.3em]" fill="currentColor" viewBox="0 0 24 24"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zM20.45 20.45h-3.56v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.15 1.46-2.15 2.96v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.65-1.86 3.39-1.86 3.63 0 4.3 2.39 4.3 5.5v6.25z"/></svg>
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-teal-500 transition-colors" title="Email">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      </a>
                    )}
                  </div>
                  <div className="space-y-4">
                    {member.bioKeys.map((key, i) => (
                      <p key={i} className="text-gray-500 dark:text-gray-400 text-xs font-medium leading-relaxed italic">
                        {t(key)}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-gray-100 dark:border-gray-800 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">
         {config.logoText} © 2026 Bodipo Business S.A.
      </footer>
    </div>
  );
};

export default AboutPage;
