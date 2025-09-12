import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useOrganizationalMonthlyTasksStore = defineStore('organizationalMonthlyTasks', () => {
  const items = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    const { data, error } = await supabase
      .from('organizational_monthly_tasks')
      .select('*')

    if (error) {
      console.error('Błąd pobierania:', error)
    } else {
      items.value = data
    }
    loading.value = false
  }

  async function add(entry) {
    const { id, ...data } = entry // odcinamy id, jeśli jest
    const { error } = await supabase
      .from('organizational_monthly_tasks')
      .insert([{
        name: data.name,
        note: data.note,
        date: data.date,
        recurring: data.recurring,
        done: data.done ?? false
      }])

    if (error) console.error('Błąd dodawania:', error)
    else await fetchAll()
  }

async function update(id, entry) {
  const { error } = await supabase
    .from('organizational_monthly_tasks')
    .update(entry)
    .eq('id', id)

  if (error) {
    console.error('Błąd edycji:', error)
  } else {
    // lokalna aktualizacja bez fetchAll
    const idx = items.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...entry }
    }
  }
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

  // Nowa funkcja: kopiowanie zadań z poprzedniego miesiąca
async function copyFromPreviousMonth(year, month) {
  // Poprzedni miesiąc
  const prevMonth = month - 1
  const prevYear = prevMonth === 0 ? year - 1 : year
  const prevMonthIndex = prevMonth === 0 ? 11 : prevMonth - 1

  // Pierwszy dzień poprzedniego miesiąca
  const prevFirst = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-01`

  // Ostatni dzień poprzedniego miesiąca
  const lastDay = new Date(prevYear, prevMonthIndex + 1, 0).getDate()
  const prevLast = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-${lastDay}`

  // Pobierz zadania z poprzedniego miesiąca
  const { data: prevTasks, error } = await supabase
    .from('organizational_monthly_tasks')
    .select('*')
    .gte('date', prevFirst)
    .lte('date', prevLast)

  if (error) {
    console.error('Błąd pobierania zadań z poprzedniego miesiąca:', error)
    return
  }

  if (!prevTasks.length) {
    console.log('Brak zadań do skopiowania')
    return
  }

  // Tworzymy nowe zadania z zachowaniem dnia
  const newTasks = prevTasks.map(t => {
    const originalDay = new Date(t.date).getDate()
    const newDate = `${year}-${String(month).padStart(2, '0')}-${String(originalDay).padStart(2, '0')}`
    return {
      date: newDate,
      name: t.name,
      note: t.note,
      recurring: t.recurring,
      done: false
    }
  })

  const { error: insertError } = await supabase
    .from('organizational_monthly_tasks')
    .insert(newTasks)

  if (insertError) {
    console.error('Błąd dodawania nowych zadań:', insertError)
  } else {
    await fetchAll()
  }
}



  return {
    items,
    loading,
    fetchAll,
    add,
    update,
    remove,
    markDone,
    copyFromPreviousMonth // <- tu dodajemy do return
  }
})
