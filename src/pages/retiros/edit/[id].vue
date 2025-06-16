<script setup>
import RetiroForm from '@/views/pages/retiros/RetiroForm.vue';
import { useRoute } from 'vue-router';
import { RETIROS_ACTIONS } from '@/constants/retiros';

const route = useRoute();
</script>

<template>
  <RetiroForm 
    :action="RETIROS_ACTIONS.EDIT" 
    :cargaId="Number(route.params.id)" 
  />
</template>
