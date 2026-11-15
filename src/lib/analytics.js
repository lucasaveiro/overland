// Eventos analíticos com nomes fixos. Hoje não há ferramenta de analytics
// instalada no site: os eventos vão para window.dataLayer (formato do Google
// Tag Manager / GA4), e passam a ser coletados quando uma for conectada — com
// o consentimento que ela exigir.
export const EVENTS = [
  "view_expedition", "select_expedition", "begin_reservation", "submit_expedition_lead",
  "view_films", "request_personal_film", "submit_brand_lead", "join_club_waitlist",
  "submit_off_day_lead",
];

export function track(name, params = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
}

const KEY = "offx_source";
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

/**
 * Guarda a origem da visita (parâmetros utm_* e site de referência) na
 * primeira página aberta. Fica só na sessão do navegador e só sai dali junto
 * com um formulário que a pessoa decidiu enviar.
 */
export function captureSource() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const source = { landing: window.location.pathname };
    UTM.forEach((k) => { if (params.get(k)) source[k] = params.get(k).slice(0, 120); });
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host && host !== window.location.hostname) source.referrer = host;
    }
    sessionStorage.setItem(KEY, JSON.stringify(source));
  } catch { /* navegação privada ou storage bloqueado: segue sem origem */ }
}

export function getSource() {
  let source = {};
  try { source = JSON.parse(sessionStorage.getItem(KEY) || "{}"); } catch { /* idem */ }
  return { ...source, page: window.location.pathname };
}
