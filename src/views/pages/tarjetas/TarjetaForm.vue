<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import ConfirmDeleteDialog from '@/pages/components/ConfirmDeleteDialog.vue';
import CargaCombustibleDialog from '@/pages/components/CargaCombustibleDialog.vue';
import RetiroCombustibleDialog from '@/pages/components/RetiroCombustibleDialog.vue';
import {
  fetchTarjetaById,
  fetchChoferNames,
  fetchTiposCombustibleNames,
  fetchTipoVehiculos,
  submitTarjeta,
  updateTarjeta,
  deleteTarjeta,
  submitCargaCombustible,
  submitRetiroCombustible
} from './TarjetaForm';
import { useRouter } from 'vue-router';

const router = useRouter();
const giveMeASnack = inject('Snackbar:giveMeASnack');

const props = defineProps({
  tarjetaId: { type: Number, required: false },
  action: { type: String, required: true }
});


// Props de CargaCombustibleDialog
const showCargaDialog = ref(false);
const showRetiroDialog = ref(false);
const userId = ref(1); // Esto deberías obtenerlo del auth, claro

// Form reference
const form = ref(null);
// Select options
const choferes = ref([]);
const tiposVehiculos = ref([]);
const tiposCombustibles = ref([]);
const estado = ref([
  { label: 'Activa', value: true },
  { label: 'No activa', value: false },
]);

// Form data
const formData = ref({
  numero: '',
  saldo_maximo: '',
  limite_consumo_mensual: '',
  fecha_vencimiento: null,
  tipo_combustible_id: null,
  activa: '',
  chofer_id: null,
});

const isLoading = ref(false);
const showConfirmDelete = ref(false);
const toogleShowConfirmDelete = () => (showConfirmDelete.value = !showConfirmDelete.value);

// Loaders
const loadChoferes = async () => {
  try {
    const res = await fetchChoferNames();
    if (res.success) choferes.value = res.data;
    else throw new Error(res.message);
  } catch {
    giveMeASnack({ message: 'Error cargando choferes', color: 'error' });
  }
};
const loadTiposCombustible = async () => {
  try {
    const res = await fetchTiposCombustibleNames();
    if (res.success) tiposCombustibles.value = res.data;
    else throw new Error(res.message);
  } catch {
    giveMeASnack({ message: 'Error cargando tipos de combustible', color: 'error' });
  }
};
const loadTiposVehiculos = async () => {
  tiposVehiculos.value = await fetchTipoVehiculos();
};

const loadTarjeta = async () => {
  if (!props.tarjetaId) return;
  isLoading.value = true;
  const res = await fetchTarjetaById(props.tarjetaId);
  if (res.success) {
    const fecha = res.data.ficav ? res.data.ficav.substring(0, 10) : '';
    const anoStr = res.data.ano ? res.data.ano.toString() : '';
    Object.assign(formData.value, {
      ...res.data,
      ficav: fecha,
      ano: anoStr,
    });
  } else {
    giveMeASnack({ message: res.message, color: 'error' });
  }
  isLoading.value = false;
};

// Registrar carga de combustible
const registrarCarga = async (payload) => {
  const res = await submitCargaCombustible(payload);
  if (res.success) {
    giveMeASnack({ message: 'Carga registrada correctamente', color: 'success' });
    showCargaDialog.value = false;

    // 👇 Recarga la tarjeta después de registrar
    await loadTarjeta();
  } else {
    giveMeASnack({ message: res.message, color: 'error' });
  }
};

// Registrar retiro de combustible
const registrarRetiro = async (payload) => {
  const res = await submitRetiroCombustible(payload);
  if (res.success) {
    giveMeASnack({ message: 'Retiro registrado correctamente', color: 'success' });
    showRetiroDialog.value = false;

    // 👇 Recarga la tarjeta después de registrar
    await loadTarjeta();
  } else {
    giveMeASnack({ message: res.message, color: 'error' });
  }
};

// Función específica para navegar a detalles
const goToProductDetails = () => {
  const itemId = props.tarjetaId;
  router.push(`/tarjetas/details/${itemId}`);
};

onMounted(async () => {
  await Promise.all([
    loadChoferes(),
    loadTiposVehiculos(),
    loadTiposCombustible(),
  ]);
  await loadTarjeta();
});

// Computed properties
const title = computed(() => {
  if (props.action === 'EDIT') return 'Editar Tarjeta Combustible';
  if (props.action === 'SHOW') return 'Detalles Tarjeta Combustible';
  return 'Añadir Tarjeta';
});
const btnTitle = computed(() => {
  if (props.action === 'EDIT') return 'Actualizar';
  if (props.action === 'SHOW') return 'Editar';
  return 'Guardar';
});
const canWrite = computed(() => ['CREATE', 'EDIT'].includes(props.action));

// validaciones
const excedeLimiteMensual = computed(() => {
  const acumulado = parseFloat(formData.value.consumo_cantidad_mensual_acumulado ?? 0);
  const limite = parseFloat(formData.value.limite_consumo_mensual ?? 0);

  return !isNaN(acumulado) && !isNaN(limite) && acumulado > limite;
});


// Handlers
const handleMainButtonClick = async () => {
  if (btnTitle.value === 'Editar') {
    router.push(`/tarjetas/edit/${props.tarjetaId}`);
    return;
  }
  if (!(await form.value.validate()).valid) return giveMeASnack({ message: 'Formulario inválido', color: 'error' });

  isLoading.value = true;
  const payload = { ...formData.value };
  payload.ano = parseInt(formData.value.ano, 10);
  payload.ficav = formData.value.ficav;

  const res = props.tarjetaId
    ? await updateTarjeta(props.tarjetaId, payload)
    : await submitTarjeta(payload);
  isLoading.value = false;

  if (res.success) router.push(`/tarjetas/details/${res.data.id}`);
  else giveMeASnack({ message: res.message, color: 'error' });
};

const handleDelete = async () => {
  isLoading.value = true;
  const res = await deleteTarjeta(props.tarjetaId);
  isLoading.value = false;
  if (res.success) router.push('/tarjetas');
  else giveMeASnack({ message: res.message, color: 'error' });
};

// WATCHERS
/** validación en tiempo real para asegurarte de que el 
 * consumo_cantidad_mensual_acumulado no supere el limite_consumo_mensual.
*/
watch(
  () => [formData.value.consumo_cantidad_mensual_acumulado, formData.value.limite_consumo_mensual],
  ([acumulado, limite]) => {
    const acumuladoNum = parseFloat(acumulado ?? 0);
    const limiteNum = parseFloat(limite ?? 0);

    if (!isNaN(acumuladoNum) && !isNaN(limiteNum) && acumuladoNum > limiteNum) {
      giveMeASnack({
        message: 'El acumulado mensual excede el límite permitido',
        color: 'warning',
      });
    }
  }
);

</script>

<template>
  <v-form ref="form" @submit.prevent="handleMainButtonClick">
    <v-row>
      <v-col cols="6">
        <h4 class="mb-5">{{ title }}</h4>

      </v-col>
      <v-col cols="6">
        <div class="d-flex gap-2 justify-start justify-md-end">
          <VBtn variant="outlined" prepend-icon="ri-arrow-left-line" @click="router.push('/tarjetas')"
            color="secondary">Atrás
          </VBtn>
          <v-btn v-if="props.action !== 'SHOW'" type="submit" :disabled="excedeLimiteMensual">
            {{ btnTitle }}
          </v-btn>
          <v-btn v-else type="submit">{{ btnTitle }}</v-btn>
          <v-btn v-if="props.action !== 'CREATE' && props.action !== 'SHOW'" variant="outlined"
            @click="goToProductDetails()">
            Cancelar
          </v-btn>
          <v-dialog width="80vh" v-model="showConfirmDelete">
            <confirm-delete-dialog @cancel="toogleShowConfirmDelete" @confirm="handleDelete" />
          </v-dialog>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="8">
        <!-- INFORMACION -->
        <v-row>
          <v-card class="mb-5" width="100vh" title="Información">
            <v-card-text>
              <v-row>
                <!-- Número -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="formData.numero" label="Número" :readonly="!canWrite" />
                </v-col>
                <!-- Fecha de vencimiento -->
                <v-col cols="12" md="6"><v-text-field v-model="formData.fecha_vencimiento" type="date"
                    label="Fecha de vencimiento" :readonly="!canWrite" /></v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-row>

        <!-- SALDO -->
        <v-row class="mb-5">
          <v-card title="Saldo" width="100vh">
            <v-card-text>
              <v-row>
                <!-- Saldo Monetario Actual -->
                <v-col v-if="props.action !== 'CREATE'" cols="12" md="6"><v-text-field
                    v-model="formData.saldo_monetario_actual" label="Saldo Actual" :readonly="!canWrite"
                    required /></v-col>
                <!-- Saldo Maximo -->
                <v-col cols="12" md="6"><v-text-field v-model="formData.saldo_maximo" label="Saldo Máximo"
                    :readonly="!canWrite" required /></v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-row>

        <!-- COMBUSTIBLE -->
        <v-row>
          <v-card title="Combustible" width="100vh">
            <!-- Dialog para registrar cargas de combustible -->
            <v-dialog v-model="showCargaDialog" width="auto">
              <CargaCombustibleDialog :tarjetaId="props.tarjetaId" :registradoPorId="userId"
                :tipoCombustibleId="formData.tipo_combustible_id" :saldoActual="formData.saldo_monetario_actual"
                @cancel="showCargaDialog = false" @confirm="registrarCarga" />
            </v-dialog>
            <!-- Dialog para registrar retiros de combustible -->
            <v-dialog v-model="showRetiroDialog" width="auto">
              <RetiroCombustibleDialog :tarjetaId="props.tarjetaId" :registradoPorId="userId"
                :tipoCombustibleId="formData.tipo_combustible_id" :cantidadActual="formData.cantidad_actual"
                @cancel="showRetiroDialog = false" @confirm="registrarRetiro" />
            </v-dialog>
            <template #append>
              <v-btn class="me-3" v-if="props.action === 'EDIT'" color="secondary" variant="outlined"
                append-icon="ri-gas-station-line" @click="showCargaDialog = true">+
              </v-btn>

              <v-btn v-if="props.action === 'EDIT'" color="secondary" variant="outlined"
                append-icon="ri-gas-station-line" @click="showRetiroDialog = true">-
              </v-btn>
            </template>

            <v-card-text>
              <v-row>
                <!-- Cantidad Combustible Actual -->
                <v-col cols="12" md="6" v-if="props.action !== 'CREATE'"><v-text-field
                    v-model="formData.cantidad_actual" label="Cantidad Actual" :readonly="!canWrite" required /></v-col>
                <!-- Acumulado Mensual -->
                <v-col v-if="props.action !== 'CREATE'" cols="12" md="6">
                  <v-text-field v-model="formData.consumo_cantidad_mensual_acumulado" label="Acumulado Mensual"
                    :error="parseFloat(formData.consumo_cantidad_mensual_acumulado) > parseFloat(formData.limite_consumo_mensual)"
                    :error-messages="parseFloat(formData.consumo_cantidad_mensual_acumulado) > parseFloat(formData.limite_consumo_mensual) ? 'Acumulado supera el límite' : ''"
                    readonly required color="info" />
                </v-col>
                <!-- Límite Consumo Mensual -->
                <v-col cols="12" md="6"><v-text-field v-model="formData.limite_consumo_mensual"
                    label="Límite Consumo Mensual" required /></v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-row>
      </v-col>
      <v-col cols="4">
        <v-card>
          <v-card-text>
            <!-- Chofer -->
            <v-col cols="12">
              <VAutocomplete v-model="formData.chofer_id" :items="choferes" item-title="nombre" item-value="id"
                label="Chofer" clearable :readonly="!canWrite" />
            </v-col>
            <!-- Tipo combustible -->
            <v-col cols="12">
              <VSelect v-model="formData.tipo_combustible_id" :items="tiposCombustibles" item-title="nombre"
                item-value="id" label="Tipo Combustible" :readonly="!canWrite" required />
            </v-col>

            <!-- Estado -->
            <v-col>
              <VSelect v-model="formData.activa" :items="estado" :item-title="(item) => item.label" item-value="value"
                label="Estado" :readonly="!canWrite" required />
            </v-col>

          </v-card-text>
        </v-card>
        <div class="d-flex justify-end mt-5 ">
          <v-btn v-if="props.action === 'EDIT'" icon="ri-delete-bin-line" color="error" variant="text"
            @click="toogleShowConfirmDelete"></v-btn>
        </div>
      </v-col>

    </v-row>

  </v-form>
</template>
