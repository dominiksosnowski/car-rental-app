import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useOrganizationalMoneyGivenStore = defineStore('organizationalMoneyGiven', () => {
  const items = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    const { data, error } = await supabase
      .from('organizational_money_given')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Błąd pobierania:', error)
    } else {
      items.value = data
    }
    loading.value = false
  }

  async function add(entry) {
    const { error } = await supabase
      .from('organizational_money_given')
      .insert([entry])

    if (error) console.error('Błąd dodawania:', error)
    else await fetchAll()
  }

  async function update(id, entry) {
    const { error } = await supabase
      .from('organizational_money_given')
      .update(entry)
      .eq('id', id)

    if (error) console.error('Błąd edycji:', error)
    else await fetchAll()
  }

  async function remove(id) {
    const { error } = await supabase
      .from('organizational_money_given')
      .delete()
      .eq('id', id)

    if (error) console.error('Błąd usuwania:', error)
    else await fetchAll()
  }

  return { items, loading, fetchAll, add, update, remove }
})
