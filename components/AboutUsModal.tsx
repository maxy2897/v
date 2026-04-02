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
    name: "D. V. Nguema Elebiyo Mangue",
    role: "Director de Relaciones Institucionales",
    bio: [
      "En esta dirección se diseñan, analizan y gestionan los proyectos estratégicos, garantizando su adecuada ejecución conforme a las directrices establecidas por el cliente externo y el gabinete empresarial.",
      "Asimismo, es responsable de la planificación y propuesta de los recursos humanos y materiales necesarios para el desarrollo de cada proyecto aprobado, asegurando una asignación eficiente y alineada con los objetivos organizacionales."
    ],
    image: "/images/dv-nguema.jpeg",
    email: "nguemaelebiyo@gmail.com",
    linkedin: "https://www.linkedin.com/in/vistremundo-nguema-elebiyo-mangue-5149a0216/"
  }
];

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 bg-black/5 hover:bg-black/10 p-2 rounded-full transition-colors"
              title="Cerrar"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
               <img 
                 src={TEAM_MEMBERS[0].image} 
                 alt={TEAM_MEMBERS[0].name}
                 className="w-full h-full object-cover object-top"
                 onError={(e) => {
                   (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800';
                 }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
               <div className="absolute bottom-6 left-6 text-white md:hidden">
                  <h3 className="text-xl font-black uppercase tracking-tight">{TEAM_MEMBERS[0].name}</h3>
                  <p className="text-teal-400 text-xs font-bold uppercase tracking-widest">{TEAM_MEMBERS[0].role}</p>
               </div>
            </div>

            <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto bg-white flex flex-col">
               <div className="mb-8 hidden md:block">
                  <h2 className="text-3xl font-black text-[#00151a] uppercase tracking-tighter mb-2">{TEAM_MEMBERS[0].name}</h2>
                  <p className="text-teal-600 font-bold uppercase tracking-[0.2em] text-xs">{TEAM_MEMBERS[0].role}</p>
               </div>

               <div className="space-y-6">
                  <div className="prose prose-teal">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-4">Sobre el Director</p>
                    {TEAM_MEMBERS[0].bio.map((paragraph, i) => (
                      <p key={i} className="text-gray-600 text-sm leading-relaxed font-medium">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-gray-100 italic text-gray-400 text-xs text-center font-medium">
                    "Los negocios no tienen fronteras, pero la responsabilidad institucional es el puente que los hace posibles."
                  </div>
               </div>

               <div className="mt-auto pt-8 flex justify-center">
                  <div className="flex items-center gap-4">
                     {TEAM_MEMBERS[0].linkedin && (
                       <a 
                         href={TEAM_MEMBERS[0].linkedin} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                         title="LinkedIn"
                       >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zM20.45 20.45h-3.56v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.15 1.46-2.15 2.96v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.65-1.86 3.39-1.86 3.63 0 4.3 2.39 4.3 5.5v6.25z"/></svg>
                       </a>
                     )}
                     {TEAM_MEMBERS[0].email && (
                       <a 
                         href={`mailto:${TEAM_MEMBERS[0].email}`}
                         className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                         title="Email"
                       >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                       </a>
                     )}
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AboutUsModal;
