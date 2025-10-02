// src/stores/organizationalConstructionCostsStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useConstructionCostsStore = defineStore(
  'constructionCosts',
  () => {
    const items = ref([])
    const loading = ref(false)

    async function fetchAll() {
      loading.value = true
      const { data, error } = await supabase
        .from('construction_costs')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        console.error('Błąd pobierania kosztów:', error)
      } else {
        items.value = data
      }
      loading.value = false
    }

    async function addCost(entry) {
      const { error } = await supabase
        .from('construction_costs')
        .insert([entry])

      if (error) {
        console.error('Błąd dodawania kosztu:', error)
      } else {
        await fetchAll()
      }
    }

    async function updateCost(id, entry) {
      const { error } = await supabase
        .from('construction_costs')
        .update(entry)
        .eq('id', id)

      if (error) {
        console.error('Błąd edycji kosztu:', error)
      } else {
        await fetchAll()
      }
    }

    async function removeCost(id) {
      const { error } = await supabase
        .from('construction_costs')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Błąd usuwania kosztu:', error)
      } else {
        await fetchAll()
      }
    }

    return {
      items,
      loading,
      fetchAll,
      addCost,
      updateCost,
      removeCost
    }
  }
)
