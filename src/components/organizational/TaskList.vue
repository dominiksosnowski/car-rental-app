<template>
  <v-list density="compact">
    <template v-for="(item, idx) in items" :key="item.id">
      <v-list-item>
        <v-list-item-content>
          <div class="d-flex align-center mb-1">
            <v-icon color="blue" class="me-2">mdi-calendar</v-icon>
            <strong>Data:</strong>&nbsp;{{ new Date(item.date).toLocaleDateString('pl-PL') }}
          </div>
          <div class="d-flex align-center mb-1">
            <v-icon color="green" class="me-2">mdi-text-box</v-icon>
            <strong>Nazwa:</strong>&nbsp;{{ item.name }}
          </div>
          <div v-if="item.note" class="d-flex align-center">
            <v-icon color="grey" class="me-2">mdi-note-text</v-icon>
            <strong>Notatka:</strong>&nbsp;{{ item.note }}
          </div>
        </v-list-item-content>

        <!-- Przyciski tylko jeśli showActions = true -->
        <v-list-item-action
          v-if="showActions"
          class="d-flex flex-row justify-end ga-2"
        >
          <v-btn color="blue" size="small" @click="$emit('edit', item)">
            <v-icon start>mdi-pencil</v-icon> Edytuj
          </v-btn>
          <v-btn color="green" size="small" @click="$emit('done', item.id)">
            <v-icon start>mdi-check</v-icon> Zrobione
          </v-btn>
        </v-list-item-action>
      </v-list-item>
<v-divider
  v-if="idx !== items.length - 1"
  class="my-3"
  :thickness="1"
  color="grey-darken-2"
  style="opacity: 1;"
/>

    </template>

    <v-list-item v-if="!items.length" title="Brak zadań" />
  </v-list>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

defineEmits(['edit', 'done'])
</script>
