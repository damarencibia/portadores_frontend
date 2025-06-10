<script setup>
import VehiculoForm from '@/views/pages/vehiculos/VehiculoForm.vue';
import { useRoute } from 'vue-router';
import { VEHICULO_ACTIONS } from '@/constants/vehiculos';

const route = useRoute();
</script>

<template>
  <VehiculoForm 
    :action="VEHICULO_ACTIONS.CREATE" 
    :vehiculoId="Number(route.params.id)" 
  />
</template>
