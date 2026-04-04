import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string[];
  image: string;
  email?: string;
  linkedin?: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: "D. V. Nguema",
    role: "Director Institucional",
    bio: [
      "En esta dirección se diseñan, analizan y gestionan los proyectos estratégicos, garantizando su adecuada ejecución conforme a las directrices establecidas por el cliente externo y el gabinete empresarial.",
      "Asimismo, es responsable de la planificación y propuesta de los recursos humanos y materiales necesarios para el desarrollo de cada proyecto aprobado, asegurando una asignación eficiente y alineada con los objetivos organizacionales."
    ],
    image: "/images/dv-nguema.jpeg",
    email: "nguemaelebiyo@gmail.com",
    linkedin: "https://www.linkedin.com/in/vistremundo-nguema-elebiyo-mangue-5149a0216/"
  }
];

interface AboutTeamPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutTeamPanel: React.FC<AboutTeamPanelProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex flex-col bg-white dark:bg-gray-900 overflow-hidden animate-in fade-in duration-500">
          {/* Custom Header like Admin */}
          <div className="bg-[#00151a] p-6 lg:p-8 flex items-center justify-between shadow-2xl relative z-10 shrink-0">
            <button 
              onClick={onClose}
              className="flex items-center gap-3 text-white/70 hover:text-teal-400 transition-all font-black uppercase tracking-[0.2em] text-[10px] group"
            >
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-teal-500 transition-colors">
                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              Volver
            </button>
            
            <div className="text-center">
              <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter">Sobre Nosotros</h2>
              <p className="text-teal-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Bodipo Business Team</p>
            </div>

            <div className="w-20 hidden lg:block" /> {/* Spacer to center title */}
          </div>

          <div className="flex-1 overflow-y-auto selection:bg-teal-100 selection:text-teal-900">
            <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
              
              {/* History Section */}
              <section className="mb-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600 mb-4">Nuestra Historia</p>
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
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border-4 border-white dark:border-gray-800 bg-[#00151a]">
                       <img 
                         src="./images/earth-bodipo.jpg" 
                         alt="Logistic Operations" 
                         className="w-full h-auto max-h-[600px] object-contain group-hover:scale-105 transition-transform duration-1000"
                       />
                    </div>
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl -z-10"></div>
                  </div>
                </div>
              </section>

              {/* Team Section */}
              <section>
                <div className="text-center mb-20">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600 mb-4">Nuestro Equipo</p>
                  <h2 className="text-3xl lg:text-5xl font-black text-[#00151a] dark:text-white uppercase tracking-tight [word-spacing:0.15em]">Personas que hacen <span className="text-teal-400 italic font-serif">posible</span> lo imposible</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
                  {TEAM_MEMBERS.map((member) => (
                    <motion.div 
                      key={member.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl mb-8 group bg-gray-100 dark:bg-gray-800">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#00151a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-8">
                           <div className="flex gap-4">
                              {member.linkedin && (
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-white hover:text-teal-600 transition-all" title="LinkedIn">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zM20.45 20.45h-3.56v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.15 1.46-2.15 2.96v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.65-1.86 3.39-1.86 3.63 0 4.3 2.39 4.3 5.5v6.25z"/></svg>
                                </a>
                              )}
                              {member.email && (
                                <a href={`mailto:${member.email}`} className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-white hover:text-teal-600 transition-all" title="Email">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                </a>
                              )}
                           </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-[#00151a] dark:text-white uppercase tracking-tighter">{member.name}</h3>
                        <p className="text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">{member.role}</p>
                        <div className="max-w-sm mx-auto">
                          {member.bio.map((p, i) => (
                            <p key={i} className="text-gray-500 dark:text-gray-400 text-xs font-medium leading-relaxed italic mb-4 last:mb-0">
                              {p}
                            </p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

            </div>
          </div>
          
          <div className="bg-[#00151a] py-6 text-center shrink-0">
             <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/30">Bodipo Business S.A. © 2026 - Trabajando por la Excelencia</p>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AboutTeamPanel;
