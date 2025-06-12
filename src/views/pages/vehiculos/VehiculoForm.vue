<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import ConfirmDeleteDialog from '@/pages/components/ConfirmDeleteDialog.vue';
import {
  fetchVehiculoById,
  fetchChoferNames,
  fetchTiposCombustibleNames,
  fetchTipoVehiculos,
  fetchEmpresas,
  submitVehiculo,
  updateVehiculo,
  deleteVehiculo,
} from './VehiculoForm';
import { useRouter } from 'vue-router';

const router = useRouter();
const giveMeASnack = inject('Snackbar:giveMeASnack');

const props = defineProps({
  vehiculoId: { type: Number, required: false },
  action: { type: String, required: true }
});

// Form reference
const form = ref(null);
// Select options
const choferes = ref([]);
const tiposVehiculos = ref([]);
const tiposCombustibles = ref([]);
const empresas = ref([]);
const estadoTecnico = ref(['activo', 'paralizado', 'en_reparacion']);

// Form data
const formData = ref({
  numero_interno: '',
  marca: '',
  modelo: '',
  tipo_vehiculo: '',
  ano: '',             // Año como string YYYY
  tipo_combustible_id: null,
  indice_consumo: null,
  prueba_litro: null,
  ficav: '',           // Fecha en formato yyyy-MM-dd
  capacidad_tanque: null,
  color: '',
  chapa: '',
  numero_motor: '',
  empresa_id: null,
  numero_chasis: '',
  estado_tecnico: '',
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
const loadEmpresas = async () => {
  const res = await fetchEmpresas();
  if (res.success) empresas.value = res.data;
};
const loadVehiculo = async () => {
  if (!props.vehiculoId) return;
  isLoading.value = true;
  const res = await fetchVehiculoById(props.vehiculoId);
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

// Función específica para navegar a detalles
const goToProductDetails = () => {
  const itemId = props.vehiculoId;
  router.push(`/vehiculos/details/${itemId}`);
};

onMounted(async () => {
  await Promise.all([
    loadChoferes(),
    loadTiposVehiculos(),
    loadTiposCombustible(),
    loadEmpresas(),
  ]);
  await loadVehiculo();
});

// Computed properties
const title = computed(() => {
  if (props.action === 'EDIT') return 'Editar Vehículo';
  if (props.action === 'SHOW') return 'Detalles del Vehículo';
  return 'Añadir Vehículo';
});
const btnTitle = computed(() => {
  if (props.action === 'EDIT') return 'Actualizar';
  if (props.action === 'SHOW') return 'Editar';
  return 'Guardar';
});
const canWrite = computed(() => ['CREATE', 'EDIT'].includes(props.action));

// Handlers
const handleMainButtonClick = async () => {
  if (btnTitle.value === 'Editar') {
    router.push(`/vehiculos/edit/${props.vehiculoId}`);
    return;
  }
  if (!(await form.value.validate()).valid) return giveMeASnack({ message: 'Formulario inválido', color: 'error' });

  isLoading.value = true;
  const payload = { ...formData.value };
  payload.ano = parseInt(formData.value.ano, 10);
  payload.ficav = formData.value.ficav;

  const res = props.vehiculoId
    ? await updateVehiculo(props.vehiculoId, payload)
    : await submitVehiculo(payload);
  isLoading.value = false;

  if (res.success) router.push(`/vehiculos/details/${res.data.id}`);
  else giveMeASnack({ message: res.message, color: 'error' });
};

const handleDelete = async () => {
  isLoading.value = true;
  const res = await deleteVehiculo(props.vehiculoId);
  isLoading.value = false;
  if (res.success) router.push('/vehiculos');
  else giveMeASnack({ message: res.message, color: 'error' });
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
          <VBtn variant="outlined" prepend-icon="ri-arrow-left-line" @click="router.push('/vehiculos')"
            color="secondary">Atrás
          </VBtn>
          <v-btn v-if="props.action !== 'SHOW'" type="submit">{{ btnTitle }}</v-btn>
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
        <v-row>

          <!-- Número Interno -->
          <v-col cols="12" md="4">
            <v-text-field v-model="formData.numero_interno" label="Número Interno" :readonly="!canWrite" />
          </v-col>
          <!-- Marca y Modelo -->
          <v-col cols="12" md="4"><v-text-field v-model="formData.marca" label="Marca" :readonly="!canWrite"
              required /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="formData.modelo" label="Modelo" :readonly="!canWrite"
              required /></v-col>

          <!-- Año de fabricación -->
          <v-col cols="12" md="4">
            <v-text-field v-model="formData.ano" label="Año de fabricación" :readonly="!canWrite" required type="text"
              placeholder="YYYY" :rules="[(v) => /^\d{4}$/.test(v) || 'Formato YYYY']" />
          </v-col>
          <v-col cols="12" md="4"><v-text-field v-model="formData.indice_consumo" label="Índice de consumo (lts)"
              :readonly="!canWrite" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="formData.prueba_litro" label="Prueba litro"
              :readonly="!canWrite" /></v-col>
          <!-- FICAV -->
          <v-col cols="12" md="4"><v-text-field v-model="formData.ficav" type="date" label="FICAV"
              :readonly="!canWrite" /></v-col>
          <!-- Capacidad tanque -->
          <v-col cols="12" md="4"><v-text-field v-model="formData.capacidad_tanque" label="Capacidad tanque (lts)"
              :readonly="!canWrite" /></v-col>
          <!-- Color -->
          <v-col cols="12" md="4"><v-text-field v-model="formData.color" label="Color" :readonly="!canWrite" /></v-col>
          <!-- Chapa, motor, chasis -->
          <v-col cols="12" md="4"><v-text-field v-model="formData.chapa" label="Chapa" :readonly="!canWrite" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="formData.numero_motor" label="Número motor"
              :readonly="!canWrite" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="formData.numero_chasis" label="Número chasis"
              :readonly="!canWrite" /></v-col>
        </v-row>


      </v-col>
      <v-col cols="4">
        <v-card>
          <v-card-text>
            <!-- Chofer -->
            <v-col cols="12">
              <VAutocomplete v-model="formData.chofer_id" :items="choferes" item-title="nombre" item-value="id" label="Chofer"
              clearable return-object :readonly="!canWrite"/>
            </v-col>
            <!-- Tipo Vehículo -->
            <v-col cols="12">
              <VSelect v-model="formData.tipo_vehiculo" :items="tiposVehiculos" label="Tipo Vehículo"
                :readonly="!canWrite" required />
            </v-col>
            <!-- Tipo combustible e índices -->
            <v-col cols="12">
              <VSelect v-model="formData.tipo_combustible_id" :items="tiposCombustibles" item-title="nombre"
                item-value="id" label="Tipo Combustible" :readonly="!canWrite" required />
            </v-col>
            <!-- Estado técnico -->
            <v-col cols="12">
              <VSelect v-model="formData.estado_tecnico" :items="estadoTecnico" label="Estado técnico"
                :readonly="!canWrite" required />
            </v-col>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <div class="d-flex justify-end ">
      <v-btn v-if="props.action === 'EDIT'" icon="ri-delete-bin-line" color="error" variant="text"
        @click="toogleShowConfirmDelete"></v-btn>
    </div>
  </v-form>
</template>
