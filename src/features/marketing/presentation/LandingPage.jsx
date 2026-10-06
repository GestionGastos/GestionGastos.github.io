import { ArrowRight, BarChart3, CheckCircle2, History, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/presentation/Button.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';

export const LandingPage = () => { 
    const { t } = useI18n(); 
    const features = t('landing.features'); 
    return (
        <PublicLayout>
            <main className="landing landing--fintrack module-page module-page--marketing">
                <section className="landing__hero">
                    <div className="landing__copy">
                        <div className="landing-badge">
                            <Sparkles size={15} /> Análisis financiero de alta precisión
                        </div>
                        <h1>Domina tus finanzas con <span>precisión quirúrgica</span></h1>
                        <p>La plataforma de seguimiento financiero diseñada para quienes exigen claridad absoluta. Visualiza cada centavo y proyecta tu futuro con herramientas inteligentes.</p>
                        <div className="hero-actions">
                            <Button as={Link} to="/registro"><span>Comenzar gratis</span><ArrowRight size={18} /></Button>
                            <Button as={Link} to="/login" variant="ghost">Ingresar</Button>
                        </div>
                        <div className="landing-trust">
                            <CheckCircle2 size={16} /> Tus datos están protegidos con seguridad de grado empresarial
                        </div>
                    </div>
                    <div className="landing-visual">
                        <div className="visual-orbit visual-orbit--one" />
                        <div className="visual-orbit visual-orbit--two" />
                        <div className="budget-preview">
                            <div className="preview-topline">
                                <span>Presupuesto actual</span>
                                <span className="status-dot">Activo</span>
                            </div>
                            <strong>$ 2.450.000</strong>
                            <div className="preview-chart">
                                <span style={{ '--value': '58%' }} />
                                <span style={{ '--value': '26%' }} />
                                <span style={{ '--value': '42%' }} />
                                <span style={{ '--value': '18%' }} />
                            </div>
                            <div className="preview-metrics">
                                <p><small>Disponible</small>$ 780.000</p>
                                <p><small>Gastos fijos</small>$ 1.220.000</p>
                                <p><small>Ahorro</small>$ 450.000</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="feature-strip" aria-label="Funciones">
                    {features.map((feature, index) => { 
                        const Icon = [History, BarChart3, ShieldCheck][index] || ShieldCheck; 
                        return (
                            <article key={feature}>
                                <Icon size={22} />
                                <span>{feature}</span>
                            </article>
                        ) 
                    })}
                </section>
            </main>
        </PublicLayout>
    ) 
}
