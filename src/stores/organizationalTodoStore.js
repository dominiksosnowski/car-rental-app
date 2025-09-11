import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useOrganizationalTodoStore = defineStore('organizationalTodo', () => {
  const items = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    const { data, error } = await supabase
      .from('organizational_todo')
      .select('*')
      .eq('done', false) // tylko niezrobione
      .order('date', { ascending: true })

    if (error) {
      console.error('Błąd pobierania:', error)
    } else {
      items.value = data
    }
    loading.value = false
  }

  async function fetchDone() {
    loading.value = true
    const { data, error } = await supabase
      .from('organizational_todo')
      .select('*')
      .eq('done', true) // tylko zrobione
      .order('date', { ascending: true })

    if (error) {
      console.error('Błąd pobierania (done=true):', error)
    } else {
      items.value = data
    }
    loading.value = false
  }

  async function add(entry) {
    const { error } = await supabase
      .from('organizational_todo')
      .insert([{ ...entry, done: false }])

    if (error) console.error('Błąd dodawania:', error)
    else await fetchAll()
  }

  async function update(id, entry) {
    const { error } = await supabase
      .from('organizational_todo')
      .update(entry)
      .eq('id', id)

    if (error) console.error('Błąd edycji:', error)
    else await fetchAll()
  }

  async function markDone(id) {
    const { error } = await supabase
      .from('organizational_todo')
      .update({ done: true })
      .eq('id', id)

    if (error) console.error('Błąd oznaczania jako zrobione:', error)
    else await fetchAll()
  }

  return { items, loading, fetchAll, fetchDone, add, update, markDone }
})
