// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxtjs/supabase'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error']
    }
  },

  // Supabase: Werte kommen aus .env bzw. Cloudflare-Umgebungsvariablen
  // (NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_KEY).
  // Ohne Konfiguration läuft die Seite im Demo-Modus mit Beispielinhalten.
  supabase: {
    url: process.env.SUPABASE_URL || 'https://demo.supabase.co',
    key: process.env.SUPABASE_KEY || 'demo-key',
    redirect: false,
    types: false
  },

  runtimeConfig: {
    public: {
      siteUrl: 'https://www.imkerei-ausm-laendle.de'
    }
  },

  routeRules: {
    '/admin/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex' } }
  },

  vite: {
    optimizeDeps: {
      include: [
        '@nuxt/ui > prosemirror-state',
        '@nuxt/ui > prosemirror-transform',
        '@nuxt/ui > prosemirror-model',
        '@nuxt/ui > prosemirror-view',
        '@nuxt/ui > prosemirror-gapcursor'
      ]
    }
  }
})
