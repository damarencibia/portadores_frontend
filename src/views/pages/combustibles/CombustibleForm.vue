<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import ConfirmDeleteDialog from '@/pages/components/ConfirmDeleteDialog.vue';
import {
  fetchCombustibleById,
  submitCombustible,
  updateCombustible,
  deleteCombustible,
} from './CombustibleForm';

import { useRouter } from 'vue-router';

const router = useRouter();
const giveMeASnack = inject('Snackbar:giveMeASnack');

const props = defineProps({
  combustibleId: { type: Number, required: false },
  action: { type: String, required: true },
});

const form = ref(null);
const formData = ref({
  nombre: '',
  precio: ''
});

const combustibleDetails = ref(null);
const isLoading = ref(false);
const showConfirmDelete = ref(false);
const toogleShowConfirmDelete = () => (showConfirmDelete.value = !showConfirmDelete.value);

const loadCombustibleForShow = async () => {
  if (!props.combustibleId) return;
  isLoading.value = true;
  try {
    const res = await fetchCombustibleById(props.combustibleId);
    if (res.success) {
      combustibleDetails.value = res.data;
      Object.assign(formData.value, res.data);
    } else {
      giveMeASnack({ message: res.message || 'Error al cargar el combustible.', color: 'error' });
      if (res.message === 'Combustible no encontrado.') router.push('/combustibles');
    }
  } catch (error) {
    console.error(error);
    giveMeASnack({ message: 'Error inesperado al cargar el combustible.', color: 'error' });
  } finally {
    isLoading.value = false;
  }
};

const loadCombustible = async () => {
  if (!props.combustibleId) return;
  isLoading.value = true;
  try {
    const res = await fetchCombustibleById(props.combustibleId);
    if (res.success) {
      Object.assign(formData.value, res.data);
    } else {
      giveMeASnack({ message: res.message || 'Error al cargar para edición.', color: 'error' });
      if (res.message === 'Combustible no encontrado.') router.push('/combustibles');
    }
  } catch (error) {
    console.error(error);
    giveMeASnack({ message: 'Error inesperado al cargar para edición.', color: 'error' });
  } finally {
    isLoading.value = false;
  }
};

const goToCombustibleDetails = () => {
  router.push(`/combustibles/details/${props.combustibleId}`);
};

onMounted(async () => {
  if (props.action === 'EDIT') await loadCombustible();
  else if (props.action === 'SHOW') await loadCombustibleForShow();
});

const title = computed(() => {
  if (props.action === 'EDIT') return 'Editar Combustible';
  if (props.action === 'SHOW') return 'Detalles del Combustible';
  return 'Añadir Nuevo Combustible';
});

const btnTitle = computed(() => {
  if (props.action === 'EDIT') return 'Actualizar';
  if (props.action === 'SHOW') return 'Editar';
  return 'Guardar';
});

const canWrite = computed(() => ['CREATE', 'EDIT'].includes(props.action));

const handleMainButtonClick = async () => {
  if (btnTitle.value === 'Editar') {
    router.push(`/combustibles/edit/${props.combustibleId}`);
    return;
  }

  if (!form.value || !(await form.value.validate()).valid) {
    return giveMeASnack({ message: 'Formulario inválido. Revise los campos requeridos.', color: 'error' });
  }

  isLoading.value = true;
  const payload = { ...formData.value };

  let res;
  if (props.combustibleId) {
    res = await updateCombustible(props.combustibleId, payload);
  } else {
    res = await submitCombustible(payload);
  }
  isLoading.value = false;

  if (res.success) {
    giveMeASnack({ message: res.message || 'Combustible guardado con éxito.', color: 'success' });
    router.push(`/combustibles/details/${res.data.id}`);
  } else {
    giveMeASnack({ message: res.message || 'Error al guardar el combustible.', color: 'error' });
  }
};

const handleDelete = async () => {
  isLoading.value = true;
  try {
    const res = await deleteCombustible(props.combustibleId);
    if (res.success) {
      giveMeASnack({ message: res.message || 'Combustible eliminado.', color: 'success' });
      router.push('/combustibles');
    } else {
      giveMeASnack({ message: res.message || 'Error al eliminar el combustible.', color: 'error' });
    }
  } catch (error) {
    console.error(error);
    giveMeASnack({ message: 'Error inesperado al eliminar.', color: 'error' });
  } finally {
    isLoading.value = false;
    showConfirmDelete.value = false;
  }
};
</script>

<template>
  <v-form ref="form" @submit.prevent="handleMainButtonClick">
    <v-row>
      <v-col cols="6">
        <h4 class="mb-5">{{ title }}</h4>
      </v-col>
      <v-col cols="6">
        <div class="d-flex gap-2 justify-start justify-md-end">
          <VBtn variant="outlined" prepend-icon="ri-arrow-left-line" @click="router.push('/combustibles')" color="secondary">
            Atrás
          </VBtn>
          <v-btn type="submit" :loading="isLoading">
            {{ btnTitle }}
          </v-btn>
          <v-btn v-if="props.action !== 'CREATE' && props.action !== 'SHOW'" variant="outlined" @click="goToCombustibleDetails()" :disabled="isLoading">
            Cancelar
          </v-btn>
          <v-btn v-if="props.action === 'SHOW'" color="error" variant="outlined" @click="toogleShowConfirmDelete" prepend-icon="ri-delete-bin-line" :disabled="isLoading">
            Eliminar
          </v-btn>
          <v-dialog width="80vh" v-model="showConfirmDelete">
            <confirm-delete-dialog @cancel="toogleShowConfirmDelete" @confirm="handleDelete" />
          </v-dialog>
        </div>
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-5">
      <v-card class="mb-5" width="100vh" title="Información del Combustible">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.nombre" label="Nombre" :readonly="!canWrite" :loading="isLoading" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.precio" label="Precio" :readonly="!canWrite" :loading="isLoading" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-row>
  </v-form>
</template>

<style scoped>
.cl {
  color: #d7b36b;
}
</style>
