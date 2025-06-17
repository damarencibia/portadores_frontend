<script setup>
import UsuarioForm from '@/views/pages/usuarios/UsuarioForm.vue';
import { useRoute } from 'vue-router';
import { USER_ACTIONS } from '@/constants/usuarios';

const route = useRoute();
</script>

<template>
  <UsuarioForm 
    :action="USER_ACTIONS.SHOW" 
    :usuarioId="Number(route.params.id)" 
  />
</template>
