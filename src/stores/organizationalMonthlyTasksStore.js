import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useOrganizationalMonthlyTasksStore = defineStore('organizationalMonthlyTasks', () => {
  const items = ref([])
  const loading = ref(false)

  async function fetchAll(month) {
    loading.value = true
    const { data, error } = await supabase
      .from('organizational_monthly_tasks')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('Błąd pobierania:', error)
    } else {
      items.value = data
    }
    loading.value = false
  }

  async function add(entry) {
    const { error } = await supabase
      .from('organizational_monthly_tasks')
      .insert([entry])
    if (error) console.error('Błąd dodawania:', error)
    else await fetchAll()
  }

  async function update(id, entry) {
    const { error } = await supabase
      .from('organizational_monthly_tasks')
      .update(entry)
      .eq('id', id)
    if (error) console.error('Błąd edycji:', error)
    else await fetchAll()
  }

  async function remove(id) {
    const { error } = await supabase
      .from('organizational_monthly_tasks')
      .delete()
      .eq('id', id)
    if (error) console.error('Błąd usuwania:', error)
    else await fetchAll()
  }

  async function markDone(id) {
    const { error } = await supabase
      .from('organizational_monthly_tasks')
      .update({ done: true })
      .eq('id', id)
    if (error) console.error('Błąd oznaczania jako zrobione:', error)
    else await fetchAll()
  }

  // Automatyczne dodanie zadań na nowy miesiąc
  async function ensureRecurringTasksForMonth(year, month) {
    const firstDay = new Date(year, month - 1, 1).toISOString().slice(0, 10)
    const lastDay = new Date(year, month, 0).toISOString().slice(0, 10)

    // Sprawdź, czy są już zadania w tym miesiącu
    const { data: existing, error: err1 } = await supabase
      .from('organizational_monthly_tasks')
      .select('*')
      .gte('date', firstDay)
      .lte('date', lastDay)

    if (err1) {
      console.error('Błąd sprawdzania istniejących zadań:', err1)
      return
    }

    if (existing.length === 0) {
      // Pobierz wzorce z poprzedniego miesiąca
      const prevFirst = new Date(year, month - 2, 1).toISOString().slice(0, 10)
      const prevLast = new Date(year, month - 1, 0).toISOString().slice(0, 10)

      const { data: prevTasks, error: err2 } = await supabase
        .from('organizational_monthly_tasks')
        .select('*')
        .gte('date', prevFirst)
        .lte('date', prevLast)
        .eq('recurring', true)

      if (err2) {
        console.error('Błąd pobierania zadań cyklicznych:', err2)
        return
      }

      if (prevTasks.length > 0) {
        const newTasks = prevTasks.map(t => ({
          date: firstDay,
          name: t.name,
          note: t.note,
          done: false,
          recurring: true
        }))
        const { error: err3 } = await supabase
          .from('organizational_monthly_tasks')
          .insert(newTasks)
        if (err3) console.error('Błąd dodawania nowych zadań:', err3)
      }
    }
  }

  return { items, loading, fetchAll, add, update, remove, markDone, ensureRecurringTasksForMonth }
})
