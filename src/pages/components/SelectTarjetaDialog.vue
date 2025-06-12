<template>
    <v-dialog v-model="model" max-width="500">
      <v-card>
        <v-card-title>Seleccionar Tarjeta</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="tarjeta"
            :items="tarjetas"
            item-title="numero"
            item-value="id"
            label="Tarjeta de Combustible"
            return-object
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="outlined" @click="$emit('cancel')">Cancelar</v-btn>
          <v-btn :disabled="!tarjeta" color="primary" @click="$emit('select', tarjeta)">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  defineProps(['modelValue', 'tarjetas'])
  const model = defineModel()
  const tarjeta = ref(null)
  </script>
  