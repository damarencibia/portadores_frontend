<script setup>
import CargaForm from '@/views/pages/cargas/CargaForm.vue';
import { useRoute } from 'vue-router';
import { CARGA_ACTIONS } from '@/constants/cargas';

const route = useRoute();
</script>

<template>
  <CargaForm 
    :action="CARGA_ACTIONS.CREATE" 
    :cargaId="Number(route.params.id)" 
  />
</template>
