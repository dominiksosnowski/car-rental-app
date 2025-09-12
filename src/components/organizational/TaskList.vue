<template>
  <v-list density="compact">
    <template v-for="(item, idx) in items" :key="item.id">
      <v-list-item :class="{ 'done-task': item.done }">
        <v-list-item-content>
          <!-- Treść zadania -->
          <div class="task-content" :class="{ 'faded': item.done }">
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
          </div>

          <!-- Nakładka "Zrobiono" -->
          <div v-if="item.done" class="done-overlay">
            <v-icon size="32" color="black" class="me-2">mdi-check-circle</v-icon>
            <span>Zrobiono</span>
          </div>
        </v-list-item-content>

        <!-- Akcje na dole -->
        <v-list-item-action class="actions-row">
          <!-- Lewa strona: zależna od trybu -->
  <div class="left-actions"           v-if="showActions">
    <template v-if="mode === 'monthly'">
      <v-switch
        v-model="item.done"
        color="green"
        hide-details
        inset
        @change="$emit('toggle-done', { id: item.id, done: item.done })"
      />
    </template>
    <template v-else>
      <v-btn
        :color="item.done ? 'grey' : 'green'"
        size="small"
        @click="$emit('toggle-done', { id: item.id, done: !item.done })"
      >
        <v-icon start>mdi-check</v-icon>
        {{ item.done ? 'Cofnij' : 'Zrobione' }}
      </v-btn>
    </template>
  </div>

          <!-- Prawa strona: edytuj / usuń -->
          <div class="right-actions-row"           v-if="showActions">
            <v-spacer />
            <v-btn color="blue" size="small" @click="$emit('edit', item)">
              <v-icon start>mdi-pencil</v-icon> Edytuj
            </v-btn>
            <v-btn color="red" size="small" @click="$emit('delete', item.id)">
              <v-icon start>mdi-delete</v-icon> Usuń
            </v-btn>
          </div>
        </v-list-item-action>
      </v-list-item>

      <v-divider v-if="idx !== items.length - 1" class="my-3" />
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
  mode: {
    type: String,
    default: 'todo' // 'monthly' lub 'todo'
  },
    showActions: {
    type: Boolean,
    default: true
  }
})

defineEmits(['edit', 'delete', 'toggle-done'])
</script>

<style scoped>
.done-task {
  background-color: rgba(76, 175, 80, 0.15) !important;
  position: relative;
  transition: background-color 0.3s ease;
}

.task-content {
  transition: opacity 0.3s ease;
}

.task-content.faded {
  opacity: 0.5;
}

.done-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: bold;
  color: black;
  pointer-events: none;
}

.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 8px;
}

.left-actions {
  display: flex;
  align-items: center;
}

.right-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
