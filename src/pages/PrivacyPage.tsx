import React from 'react';

const PrivacyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-20 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#00151a] p-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3">
                        Política de Privacidad
                    </h1>
                    <p className="text-teal-400 text-sm font-black uppercase tracking-[0.3em]">
                        BODIPO BUSINESS
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 space-y-8">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            1. Responsable del Tratamiento
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            El responsable del tratamiento de los datos personales recogidos a través de la aplicación y sitio web BODIPO BUSINESS es BODIPO BUSINESS, con actividad en la República de Guinea Ecuatorial.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            Para cualquier consulta relacionada con la protección de datos, el usuario puede contactar a través de los medios habilitados en la plataforma.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            2. Datos Personales Recopilados
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            BODIPO BUSINESS podrá recopilar los siguientes datos personales:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Nombre y apellidos</li>
                            <li>Número de teléfono</li>
                            <li>Dirección de correo electrónico</li>
                            <li>Dirección física para envíos</li>
                            <li>Información relacionada con pedidos y envíos</li>
                            <li>Cualquier otro dato necesario para la correcta prestación del servicio</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            La empresa no solicita datos innecesarios para las finalidades indicadas.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            3. Finalidad del Tratamiento de los Datos
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            Los datos personales serán tratados con las siguientes finalidades:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Gestionar pedidos, envíos y entregas</li>
                            <li>Atender consultas y solicitudes del usuario</li>
                            <li>Cumplir obligaciones legales y administrativas</li>
                            <li>Mejorar la calidad del servicio y la experiencia del usuario</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            Los datos no serán utilizados para fines distintos a los aquí indicados.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            4. Base Legal del Tratamiento
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            El tratamiento de los datos personales se basa en:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>La ejecución de un contrato o prestación de servicios</li>
                            <li>El consentimiento expreso del usuario</li>
                            <li>El cumplimiento de obligaciones legales aplicables</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            5. Conservación de los Datos
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Los datos personales se conservarán únicamente durante el tiempo necesario para:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                            <li>Cumplir la finalidad para la que fueron recopilados</li>
                            <li>Atender responsabilidades legales o contractuales</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            Una vez cumplido dicho plazo, los datos serán eliminados o anonimizados.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            6. Cesión de Datos a Terceros
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            BODIPO BUSINESS no vende ni cede datos personales a terceros, salvo en los siguientes casos:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Empresas de transporte o logística necesarias para la entrega</li>
                            <li>Autoridades públicas cuando sea legalmente requerido</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            En todos los casos, se limita la información a la estrictamente necesaria.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            7. Seguridad de los Datos
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            BODIPO BUSINESS aplica medidas técnicas y organizativas razonables para proteger los datos personales contra:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                            <li>Accesos no autorizados</li>
                            <li>Pérdida, alteración o divulgación indebida</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            No obstante, ningún sistema es completamente infalible.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            8. Derechos del Usuario
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            El usuario tiene derecho a:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Acceder a sus datos personales</li>
                            <li>Solicitar la rectificación de datos incorrectos</li>
                            <li>Solicitar la eliminación de sus datos cuando sea legalmente posible</li>
                            <li>Oponerse al tratamiento en determinados casos</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            El ejercicio de estos derechos podrá realizarse mediante solicitud a través de los canales oficiales de BODIPO BUSINESS.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            9. Datos de Menores
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Los servicios de BODIPO BUSINESS no están dirigidos a menores de edad.
                            No se recopilan deliberadamente datos personales de menores.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            10. Uso de Cookies y Tecnologías Similares
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            BODIPO BUSINESS puede utilizar cookies u otras tecnologías similares para:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Garantizar el correcto funcionamiento de la plataforma</li>
                            <li>Mejorar la experiencia del usuario</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            El usuario puede configurar su navegador para rechazar cookies, aunque ello puede afectar el funcionamiento del sitio.
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            11. Modificaciones de la Política de Privacidad
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            BODIPO BUSINESS se reserva el derecho de modificar esta Política de Privacidad en cualquier momento.
                            Las modificaciones entrarán en vigor desde su publicación en la plataforma.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section>
                        <h2 className="text-2xl font-black text-[#00151a] mb-4 tracking-tight">
                            12. Legislación Aplicable
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Esta Política de Privacidad se rige por la legislación vigente en la República de Guinea Ecuatorial.
                        </p>
                    </section>

                    {/* Footer */}
                    <div className="pt-8 mt-8 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-500 font-medium">
                            Última actualización: Enero 2026
                        </p>
                        <div className="mt-6 text-center">
                            <a
                                href="/"
                                className="inline-block bg-[#00151a] text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-teal-600 transition-all"
                            >
                                Volver al Inicio
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
