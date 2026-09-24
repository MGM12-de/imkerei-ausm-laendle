// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/supabase'],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },

  css: ['~/assets/css/main.css'],

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error']
    }
  },

  runtimeConfig: {
    public: {
      siteUrl: 'https://www.imkerei-ausm-laendle.de'
    }
  },

  routeRules: {
    '/admin/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex' } }
  },
  compatibilityDate: '2026-09-01',

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
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
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
  }
})
