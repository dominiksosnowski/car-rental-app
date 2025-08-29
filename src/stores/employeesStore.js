import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useEmployeesStore = defineStore('employees', {
  state: () => ({
    list: [],
    loading: false,
    error: null
  }),

  actions: {
async fetchAll() {
  this.loading = true
  this.error = null
  try {
    // 1. Pobierz pracowników
    const { data: employeesData, error: empError } = await supabase
      .from('employees')
      .select('*')
      .order('last_name', { ascending: true })

    if (empError) throw empError

    // 2. Pobierz wszystkie dokumenty
    const { data: docsData, error: docsError } = await supabase
      .from('employee_documents')
      .select('*')

    if (docsError) throw docsError

    // 3. Połącz dane pracowników z dokumentami
    this.list = (employeesData || []).map(e => {
      const bhpDoc = docsData.find(
        d => d.employee_id === e.id && d.file_type === 'bhp'
      ) || null

      const medicalDoc = docsData.find(
        d => d.employee_id === e.id && d.file_type === 'medical'
      ) || null

      return {
        ...e,
        bhpDoc,
        medicalDoc
      }
    })
  } catch (err) {
    console.error('Błąd przy pobieraniu pracowników:', err)
    this.error = err.message || 'Nie udało się pobrać listy'
  } finally {
    this.loading = false
  }
},


    // przy add i update po prostu przekazujemy obiekt z nowymi polami
    async add(employee) {
      this.error = null
      try {
        const { error } = await supabase
          .from('employees')
          .insert([employee]) // employee może mieć też medical_exam_date itd.

        if (error) throw error
        await this.fetchAll()
      } catch (err) {
        console.error('Błąd przy dodawaniu pracownika:', err)
        this.error = err.message
      }
    },

    async update(id, updates) {
      this.error = null
      try {
        const { error } = await supabase
          .from('employees')
          .update(updates) // updates może mieć też nowe pola
          .eq('id', id)

        if (error) throw error
        await this.fetchAll()
      } catch (err) {
        console.error('Błąd przy aktualizacji pracownika:', err)
        this.error = err.message
      }
    },


    async remove(id) {
      this.error = null
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', id)

        if (error) throw error
        await this.fetchAll()
      } catch (err) {
        console.error('Błąd przy usuwaniu pracownika:', err)
        this.error = err.message
      }
    }
  }
})
