<script setup>
import ChoferForm from '@/views/pages/choferes/ChoferForm.vue';
import { useRoute } from 'vue-router';
import { CHOFER_ACTIONS } from '@/constants/choferes';

const route = useRoute();
</script>

<template>
  <ChoferForm 
    :action="CHOFER_ACTIONS.CREATE" 
    :choferId="Number(route.params.id)" 
  />
</template>A
