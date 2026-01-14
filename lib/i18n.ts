
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/**
 * Recursos de Tradução - Organizados por Idioma (Clean Code)
 * Cada objeto contém a estrutura semântica para os módulos do sistema.
 */

const ptBR = {
  common: {
    welcome: "Bem-vindo",
    loading: "Carregando...",
    privacy: "Privacidade",
    logout: "Sair",
    language: {
      pt: "Português",
      en: "Inglês",
      es: "Espanhol"
    }
  },
  login: {
    title: "Portal da Qualidade",
    subtitle: "Aços Vital - Gestão Técnica",
    corpEmail: "E-mail Corporativo",
    accessPassword: "Senha de Acesso",
    forgotPassword: "Esqueceu a senha?",
    authenticate: "Autenticar Acesso",
    heroSubtitle: "Repositório central de documentos técnicos e certificados. Precisão industrial em cada dado.",
    footerNote: "Use suas credenciais fornecidas pela TI Aços Vital.",
    slogan: "Aço de confiança, qualidade certificada.",
    certification: "ISO 9001:2015 CERTIFICADO",
    secureData: "LINK B2B SEGURO",
    monitoring: "SISTEMAS MONITORADOS",
    error: "Falha na autenticação do portal."
  },
  cookie: {
    title: "Privacidade e Segurança",
    text: "Utilizamos cookies essenciais para garantir a segurança da autenticação e a integridade dos certificados técnicos. Ao continuar navegando no portal da Aços Vital, você concorda com nossa política de gestão de dados.",
    accept: "Aceitar e Continuar"
  },
  menu: {
    portalName: "Portal da Qualidade",
    brand: "Aços Vital"
  }
};

const enUS = {
  common: {
    welcome: "Welcome",
    loading: "Loading...",
    privacy: "Privacy",
    logout: "Logout",
    language: {
      pt: "Portuguese",
      en: "English",
      es: "Spanish"
    }
  },
  login: {
    title: "Quality Portal",
    subtitle: "Vital Steels - Technical Management",
    corpEmail: "Corporate Email",
    accessPassword: "Access Password",
    forgotPassword: "Forgot password?",
    authenticate: "Authenticate Access",
    heroSubtitle: "Central repository for technical documents and certificates. Industrial precision in every data point.",
    footerNote: "Use your credentials provided by Vital Steels IT.",
    slogan: "Steel you can trust, certified quality.",
    certification: "ISO 9001:2015 CERTIFIED",
    secureData: "SECURE B2B LINK",
    monitoring: "SYSTEMS MONITORED",
    error: "Portal authentication failed."
  },
  cookie: {
    title: "Privacy & Security",
    text: "We use essential cookies to ensure authentication security and the integrity of technical certificates. By continuing to browse the Vital Steels portal, you agree to our data management policy.",
    accept: "Accept and Continue"
  },
  menu: {
    portalName: "Quality Portal",
    brand: "Vital Steels"
  }
};

const esES = {
  common: {
    welcome: "Bienvenido",
    loading: "Cargando...",
    privacy: "Privacidad",
    logout: "Cerrar Sesión",
    language: {
      pt: "Portugués",
      en: "Inglés",
      es: "Español"
    }
  },
  login: {
    title: "Portal de Calidad",
    subtitle: "Aceros Vital - Gestión Técnica",
    corpEmail: "Correo Corporativo",
    accessPassword: "Contraseña de Acceso",
    forgotPassword: "¿Olvidó su contraseña?",
    authenticate: "Autenticar Accesso",
    heroSubtitle: "Repositorio central de documentos técnicos y certificados. Precisión industrial en cada dato.",
    footerNote: "Use suas credenciais fornecidas pela TI Aços Vital.",
    slogan: "Acero de confianza, calidad certificada.",
    certification: "ISO 9001:2015 CERTIFICADO",
    secureData: "ENLACE B2B SEGURO",
    monitoring: "SISTEMAS MONITORADOS",
    error: "Error de autenticación en el portal."
  },
  cookie: {
    title: "Privacidad y Seguridad",
    text: "Utilizamos cookies esenciales para garantizar la seguridad de la autenticación e la integridad de los certificados técnicos. Al continuar navegando por el portal de Aceros Vital, acepta nuestra política de gestión de datos.",
    accept: "Aceptar y Continuar"
  },
  menu: {
    portalName: "Portal de Calidad",
    brand: "Aceros Vital"
  }
};

const resources = {
  pt: { translation: ptBR },
  en: { translation: enUS },
  es: { translation: esES }
};

const savedLanguage = localStorage.getItem('i18nextLng') || 'pt';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "pt",
    interpolation: {
      escapeValue: false // React já protege contra XSS
    }
  });

export default i18n;
