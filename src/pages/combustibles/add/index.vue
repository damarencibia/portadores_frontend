<script setup>
import CombustibleForm from '@/views/pages/combustibles/CombustibleForm.vue';
import { useRoute } from 'vue-router';
import { FUEL_ACTIONS } from '@/constants/combustibles';

const route = useRoute();
</script>

<template>
  <CombustibleForm 
    :action="FUEL_ACTIONS.CREATE" 
    :combustibleId="Number(route.params.id)" 
  />
</template>A
