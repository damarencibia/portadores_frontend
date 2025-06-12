<script setup>
import TarjetaForm from '@/views/pages/tarjetas/TarjetaForm.vue';
import { useRoute } from 'vue-router';
import { TARJETA_ACTIONS } from '@/constants/tarjetas';

const route = useRoute();
</script>

<template>
  <TarjetaForm 
    :action="TARJETA_ACTIONS.CREATE" 
    :tarjetaId="Number(route.params.id)" 
  />
</template>
