<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import ConfirmReasonDeleteDialog from '@/pages/components/ConfirmReasonDeleteDialog.vue'
import { getStoredUser } from '@/utils/api';
import {
  fetchCargaById,
  validarCarga,
  destroyCharge
} from './CargaForm'; // Asegúrate de que la ruta a tu archivo de API sea correcta
import { useRouter } from 'vue-router';

// INICIALIZACIÓN Y PROPS
const router = useRouter();
const giveMeASnack = inject('Snackbar:giveMeASnack');
const userId = ref(getStoredUser()?.id || null);

const props = defineProps({
  cargaId: { type: Number, required: true },
  action: { type: String, required: true, default: 'SHOW' } // 'SHOW' o 'EDIT'
});

// ESTADO DEL FORMULARIO Y COMPONENTE
const form = ref(null);
const formData = ref({
  fecha: '',
  hora: '',
  cantidad: '',
  odometro: null,
  lugar: null,
  no_chip: '',
  registrado_por: null,
  validado_por: null,
  fecha_validacion: null,
  estado: null,
  tarjeta_combustible_id: null,
  motivo: null,
  importe: null,
});

const isLoading = ref(false);
const isValidating = ref(false);

// Estado para el diálogo de rechazo
const showRejectReasonDialog = ref(false);
const motivoRechazo = ref('');
const rejectIsLoading = ref(false);


// --- LÓGICA DE CARGA DE DATOS ---
const loadCarga = async () => {
  if (!props.cargaId) return;
  isLoading.value = true;
  const res = await fetchCargaById(props.cargaId);
  if (res.success) {
    const d = res.data;
    formData.value = {
      ...d,
      fecha: d.fecha?.substring(0, 10) || '',
      hora: d.hora?.substring(0, 5) || ''
    };
  } else {
    giveMeASnack({ message: res.message || 'No se pudo cargar la información.', color: 'error' });
    router.push('/cargas'); // Si no se encuentra, redirigir
  }
  isLoading.value = false;
};


// --- LÓGICA DE VALIDACIÓN Y RECHAZO ---

// 1. Manejar la validación (Aprobar)
const handleValidation = async () => {
  if (!props.cargaId) return;
  isValidating.value = true;

  const res = await validarCarga(props.cargaId, {
    valid: true,
    validadoPorId: userId.value,
  });

  if (res.success) {
    giveMeASnack({ message: 'Carga validada con éxito', color: 'success' });
    await loadCarga(); // Recargar los datos para mostrar el nuevo estado
  } else {
    giveMeASnack({ message: res.message, color: 'error' });
  }
  isValidating.value = false;
};

// 2. Abrir el diálogo para pedir el motivo del rechazo
const openRejectDialog = () => {
  motivoRechazo.value = ''; // Limpiar el motivo anterior
  showRejectReasonDialog.value = true;
};

// 3. Confirmar el rechazo desde el diálogo
const handleRejectConfirmed = async () => {
  if (!motivoRechazo.value) {
    giveMeASnack({ message: 'El motivo del rechazo es obligatorio.', color: 'error' });
    return;
  }
  if (!props.cargaId) return;

  rejectIsLoading.value = true;
  const res = await validarCarga(props.cargaId, {
    valid: false,
    validadoPorId: userId.value,
    motivoRechazo: motivoRechazo.value,
  });

  if (res.success) {
    giveMeASnack({ message: 'Carga rechazada con éxito', color: 'info' });
    showRejectReasonDialog.value = false;
    await loadCarga(); // Recargar datos para ver el estado 'rechazada'
  } else {
    giveMeASnack({ message: res.message, color: 'error' });
  }
  rejectIsLoading.value = false;
};


// --- HOOKS DE CICLO DE VIDA ---
onMounted(async () => {
  await loadCarga();
});

// --- PROPIEDADES COMPUTADAS ---
const title = computed(() => {
  if (props.action === 'EDIT') return 'Editar Carga de Combustible';
  if (props.action === 'SHOW') return 'Detalles de Carga de Combustible';
  return 'Añadir Carga';
});

// const canWrite = computed(() => ['CREATE', 'EDIT'].includes(props.action));

// --- HANDLERS ---
const showDeleteDialog = ref(false)
const isDeleting = ref(false)

function toggleDelete() {
  showDeleteDialog.value = !showDeleteDialog.value
}

async function handleDelete(reason) {
  isDeleting.value = true
  const res = await destroyCharge(props.cargaId, reason)
  isDeleting.value = false

  if (res.success) {
    giveMeASnack({ message: 'Eliminada con éxito', color: 'success' })
    router.push('/cargas')
  } else {
    giveMeASnack({ message: res.message, color: 'error' })
  }
}
</script>

<template>
  <v-form ref="form">
    <v-row>
      <v-col cols="12" md="6">
        <h4 class="mb-5">{{ title }}</h4>
      </v-col>
      <v-col cols="12" md="6">
        <div class="d-flex gap-2 justify-start justify-md-end">
          <VBtn variant="outlined" prepend-icon="ri-arrow-left-line" @click="router.push('/cargas')" color="secondary">
            Atrás
          </VBtn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="7">
        <v-card class="mb-5" width="100%" title="Información de la Carga">
          <template #append>
            <v-alert v-if="formData.estado === 'pendiente'" density="compact" type="warning" variant="tonal">
              {{ formData.estado }}
            </v-alert>
            <v-alert v-if="formData.estado === 'validada'" density="compact" type="success" variant="tonal">
              {{ formData.estado }}
            </v-alert>
            <v-alert v-if="formData.estado === 'rechazada' && formData.deleted_at === null  " density="compact" type="error" variant="tonal">
              {{ formData.estado }}
            </v-alert>
            <v-alert v-if="formData.deleted_at !== null" density="compact" type="error" variant="tonal">
              eliminada
            </v-alert>

          </template>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4"><v-text-field v-model="formData.deleted_at" type="date" label="Fecha"
                  readonly /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="formData.hora" label="Hora" type="time" readonly /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="formData.registrado_por" label="Registrador"
                  readonly /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="formData.cantidad" type="number" label="Cantidad (lts)"
                  readonly /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="formData.no_chip" label="Chip" readonly /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="formData.odometro" label="Odómetro" readonly /></v-col>
              <v-col cols="12"><v-text-field v-model="formData.lugar" label="Lugar" readonly /></v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="mb-5" width="100%" title="Saldos Monetarios">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6"><v-text-field v-model="formData.saldo_monetario_anterior"
                  label="Saldo Anterior ($)" readonly /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="formData.saldo_monetario_al_momento_carga"
                  label="Saldo Posterior ($)" readonly /></v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card width="100%" title="Saldos de Combustible">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6"><v-text-field v-model="formData.cantidad_combustible_anterior"
                  label="Combustible Anterior (lts)" readonly /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="formData.cantidad_combustible_al_momento_carga"
                  label="Combustible Posterior (lts)" readonly /></v-col>
            </v-row>
          </v-card-text>
        </v-card>

      </v-col>
      <v-col cols="12" md="5">
        <v-card title="Información Asociada" class="mb-4">
          <v-card-text>
            <v-row>
              <v-col cols="12"><v-text-field v-model="formData.tarjeta_combustible" label="Tarjeta" readonly /></v-col>
              <v-col cols="12"><v-text-field v-model="formData.chofer" label="Chofer" readonly /></v-col>
              <v-col cols="7"><v-text-field v-model="formData.tipo_combustible" label="Tipo Combustible"
                  readonly /></v-col>
              <v-col cols="5"><v-text-field v-model="formData.precio_combustible" label="Precio" prefix="$"
                  readonly /></v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <div v-if="formData.estado === 'pendiente'" class="mt-10">
          <p class="text-center text-grey-darken-1 mb-2">Acciones de Validación</p>
          <v-row>
            <v-col class="d-flex gap-4 justify-center">
              <v-btn color="success" :loading="isValidating" @click="handleValidation" variant="outlined"
                icon="ri-check-line" />

              <v-btn color="error" :loading="isValidating" @click="openRejectDialog" variant="outlined"
                icon="ri-close-line" />
            </v-col>
          </v-row>
        </div>

        <v-alert v-if="formData.estado === 'rechazada'" type="error" class="mt-4" variant="tonal">
          <p class="font-weight-bold">Carga Rechazada</p>
          <p class="mt-1">Motivo: {{ formData.motivo_rechazo }}</p>
          <p class="mt-2 text-caption">Acción realizada por: {{ formData.validado_por }} el {{ new Date(formData.fecha_validacion).toLocaleDateString()}}
          </p>
        </v-alert>

        <v-alert v-if="formData.estado === 'rechazada' && formData.deleted_at !== null" type="error" class="mt-4"
          variant="tonal">
          <p class="font-weight-bold">Carga Eliminada</p>
          <p class="mt-1">Motivo: {{ formData.deletion_reason }}</p>
          <p class="mt-2 text-caption">
            Fecha eliminación: {{ new Date(formData.deleted_at).toLocaleDateString() }}
          </p>

        </v-alert>

        <v-alert v-if="formData.estado === 'validada'" type="success" class="mt-4" variant="tonal">
          <p class="font-weight-bold">Carga Validada</p>
          <p class="mt-2 text-caption">Acción realizada por: {{ formData.validado_por }} el {{ formData.fecha_validacion
            }}
          </p>
        </v-alert>

        <!-- Componentes de eliminación -->
        <div class="d-flex justify-center mt-5" v-if="formData.estado === 'rechazada' && formData.deleted_at === null">
          <v-btn icon="ri-delete-bin-line" variant="outlined" color="error" @click="toggleDelete"></v-btn>
        </div>

        <v-dialog v-model="showDeleteDialog" max-width="450">
          <ConfirmReasonDeleteDialog :model-value="showDeleteDialog" :loading="isDeleting"
            @update:modelValue="val => showDeleteDialog = val" @cancel="showDeleteDialog = false"
            @confirm="handleDelete" />
        </v-dialog>

      </v-col>
    </v-row>
  </v-form>

  <v-dialog v-model="showRejectReasonDialog" width="500" persistent>
    <v-card>
      <v-card-title>Rechazar Carga de Combustible</v-card-title>
      <v-card-text>
        <p class="mb-4">Por favor, especifica el motivo por el cual se rechaza esta carga. Esta acción no se puede
          deshacer.</p>
        <v-textarea v-model="motivoRechazo" label="Motivo del rechazo" rows="3"
          :rules="[v => !!v || 'El motivo es requerido']" required autofocus />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="secondary" @click="showRejectReasonDialog = false" :disabled="rejectIsLoading">
          Cancelar
        </v-btn>
        <v-btn color="error" @click="handleRejectConfirmed" :loading="rejectIsLoading">
          Confirmar Rechazo
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}
</style>