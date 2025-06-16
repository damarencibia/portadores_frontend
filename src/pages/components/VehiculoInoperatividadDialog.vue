<script setup>
import { ref, watch, inject } from 'vue';
// Ajusta la ruta si tus llamadas API están en un archivo diferente
import { submitVehiculoInoperatividad, updateVehiculoInoperatividad} from '@/views/pages/vehiculos/VehiculoForm';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  vehiculoId: {
    type: Number,
    required: true,
  },
  // Opcional: Para editar una inoperatividad existente
  inoperatividadToEdit: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:isVisible', 'inoperatividad-saved']);

const giveMeASnack = inject('Snackbar:giveMeASnack');
const form = ref(null);
const isLoading = ref(false);

const inoperatividadData = ref({
  vehiculo_id: props.vehiculoId,
  fecha_salida_servicio: '',
  fecha_reanudacion_servicio: null, // Campo anulable
  motivo_averia: '',
});

// Observa los cambios en la propiedad inoperatividadToEdit para el modo de edición
watch(() => props.inoperatividadToEdit, (newVal) => {
  if (newVal) {
    // Rellena el formulario para edición
    inoperatividadData.value = {
      ...newVal,
      fecha_salida_servicio: newVal.fecha_salida_servicio ? newVal.fecha_salida_servicio.substring(0, 10) : '',
      fecha_reanudacion_servicio: newVal.fecha_reanudacion_servicio ? newVal.fecha_reanudacion_servicio.substring(0, 10) : null,
    };
  } else {
    // Reinicia el formulario para crear uno nuevo
    inoperatividadData.value = {
      vehiculo_id: props.vehiculoId,
      fecha_salida_servicio: '',
      fecha_reanudacion_servicio: null,
      motivo_averia: '',
    };
  }
}, { immediate: true });


const handleSaveInoperatividad = async () => {
  if (!(await form.value.validate()).valid) {
    giveMeASnack({ message: 'Por favor, complete todos los campos requeridos.', color: 'error' });
    return;
  }

  isLoading.value = true;
  const payload = { ...inoperatividadData.value };

  let res;
  if (props.inoperatividadToEdit && props.inoperatividadToEdit.id) {
    res = await updateVehiculoInoperatividad(props.inoperatividadToEdit.id, payload);
  } else {
    res = await submitVehiculoInoperatividad(payload);
  }

  isLoading.value = false;

  if (res.success) {
    giveMeASnack({ message: 'Inoperatividad guardada con éxito.', color: 'success' });
    emit('inoperatividad-saved');
    handleClose();
  } else {
    const errorMessage = res.data
      ? Object.values(res.data).flat().join('<br/>') // Une los errores de validación
      : res.message;
    giveMeASnack({ message: errorMessage, color: 'error' });
  }
};

const handleClose = () => {
  emit('update:isVisible', false);
  // Reinicia los datos del formulario cuando el diálogo se cierra
  inoperatividadData.value = {
    vehiculo_id: props.vehiculoId,
    fecha_salida_servicio: '',
    fecha_reanudacion_servicio: null,
    motivo_averia: '',
  };
  form.value.resetValidation(); // Limpia los errores de validación
};
</script>

<template>
  <v-dialog :model-value="isVisible" @update:model-value="handleClose" max-width="600px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ props.inoperatividadToEdit ? 'Editar' : 'Registrar' }} Inoperatividad</span>
        <v-btn icon @click="handleClose" variant="text">
          <v-icon>ri-close-line</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="handleSaveInoperatividad">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="inoperatividadData.fecha_salida_servicio"
                label="Fecha de Salida de Servicio"
                type="date"
                :rules="[(v) => !!v || 'Campo requerido']"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="inoperatividadData.fecha_reanudacion_servicio"
                label="Fecha de Reanudación de Servicio"
                type="date"
                :rules="[
                  (v) => !v || (v >= inoperatividadData.fecha_salida_servicio) || 'La fecha de reanudación no puede ser anterior a la de salida',
                ]"
                clearable
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="inoperatividadData.motivo_averia"
                label="Motivo de la Avería"
                :rules="[(v) => !!v || 'Campo requerido', (v) => (v && v.length <= 255) || 'Máximo 255 caracteres']"
                required
                rows="3"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn variant="outlined" color="secondary" @click="handleClose" :disabled="isLoading">
          Cancelar
        </v-btn>
        <v-btn color="primary" @click="handleSaveInoperatividad" :loading="isLoading">
          {{ props.inoperatividadToEdit ? 'Actualizar' : 'Guardar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>