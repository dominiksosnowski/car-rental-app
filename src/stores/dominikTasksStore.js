// src/stores/dominikTasksStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useDominikTasksStore = defineStore('dominikTasks', {
  state: () => ({
    list: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchActive() {
      this.loading = true
      this.error = null
      const { data, error } = await supabase
        .from('dominik_tasks')
        .select('*')
        .eq('done', false)
        .order('created_at', { ascending: false })
      this.loading = false
      if (error) this.error = error.message
      else this.list = data || []
    },

    async fetchDone() {
      this.loading = true
      this.error = null
      const { data, error } = await supabase
        .from('dominik_tasks')
        .select('*')
        .eq('done', true)
        .order('updated_at', { ascending: false })
      this.loading = false
      if (error) this.error = error.message
      else this.list = data || []
    },

    async add(task) {
      const payload = {
        title: task.title?.trim(),
        description: task.description?.trim() || null,
        due_date: task.due_date || null,
      }
      const { data, error } = await supabase
        .from('dominik_tasks')
        .insert([payload])
        .select('*')
        .single()
      if (error) throw error
      this.list.unshift(data)
      return data
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('dominik_tasks')
        .update({ ...updates })
        .eq('id', id)
        .select('*')
        .single()
      if (error) throw error
      this.list = this.list.map(t => t.id === id ? data : t)
      return data
    },

    async setDone(id, done = true) {
      return this.update(id, { done })
    },

    async remove(id) {
      const { error } = await supabase.from('dominik_tasks').delete().eq('id', id)
      if (error) throw error
      this.list = this.list.filter(t => t.id !== id)
    }
  }
})
