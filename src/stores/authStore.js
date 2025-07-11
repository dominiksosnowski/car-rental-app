import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),
  actions: {
    // inicjalizuje stan zalogowania i nasłuchuje zmian
    async init() {
      const { data: { session } } = await supabase.auth.getSession()
      this.user = session?.user || null

      supabase.auth.onAuthStateChange((event, session) => {
        this.user = session?.user || null
      })
    },

    // logowanie
    async signIn(email, password) {
      this.loading = true
      this.error = null

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      this.loading = false

      if (error) {
        this.error = error.message
      } else {
        this.user = data.user
      }
    },

    // rejestracja
    async signUp(email, password) {
      this.loading = true
      this.error = null

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      this.loading = false

      if (error) {
        this.error = error.message
      } else {
        this.user = data.user    // sesja może być pusta, jeśli wymagasz potwierdzenia e-mail
      }
    },

    // wylogowanie
    async signOut() {
      await supabase.auth.signOut()
      console.log('signIn result:', { data, error })
      this.user = null
    },
  },
})
