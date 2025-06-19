<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import ConfirmDeleteDialog from '@/pages/components/ConfirmDeleteDialog.vue';
import VehiculoInoperatividadDialog from '@/pages/components/VehiculoInoperatividadDialog.vue'; // Asegúrate que la ruta sea correcta

import {
  fetchVehiculoById,
  fetchChoferNames,
  fetchTiposCombustibleNames,
  fetchTipoVehiculos,
  fetchEmpresas,
  submitVehiculo,
  updateVehiculo,
  deleteVehiculo,
} from './VehiculoForm'; // Archivo principal de API de Vehiculos

// Importa las funciones API de inoperatividades desde su archivo dedicado
import {
  fetchVehiculoInoperatividades,
  deleteVehiculoInoperatividad,
} from './VehiculoForm'; // Ajusta esta ruta si es necesario

import { useRouter } from 'vue-router';

const router = useRouter();
const giveMeASnack = inject('Snackbar:giveMeASnack');

const props = defineProps({
  vehiculoId: { type: Number, required: false },
  action: { type: String, required: true },
});

// Form reference
const form = ref(null);
// Select options
const choferes = ref([]);
const tiposVehiculos = ref([]);
const tiposCombustibles = ref([]);
const empresas = ref([]);
const estadoTecnico = ref(['activo', 'paralizado', 'en_reparacion']); // Esto es una lista fija local, no de API

// Form data (para los detalles del vehículo principal)
const formData = ref({
  numero_interno: '',
  marca: '',
  modelo: '',
  tipo_vehiculo: '',
  ano: '', // Año como string
  tipo_combustible_id: null,
  indice_consumo: null,
  prueba_litro: null,
  ficav: '', // Fecha en formato YYYY-MM-dd
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

// Lógica para la confirmación de eliminación del VEHÍCULO principal
const showConfirmDelete = ref(false);
const toogleShowConfirmDelete = () => (showConfirmDelete.value = !showConfirmDelete.value);

// Nuevos estados para la gestión de inoperatividades
const showInoperatividadDialog = ref(false);
const inoperatividadToEdit = ref(null); // Para editar una inoperatividad existente
const inoperatividades = ref([]); // Lista de inoperatividades del vehículo
const showConfirmDeleteInoperatividad = ref(false);
const inoperatividadToDeleteId = ref(null);


// Loaders (para los datos del formulario de vehículo)
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

// Carga los detalles del vehículo principal
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
    // Si no se encuentra el vehículo en SHOW/EDIT, redirigir
    if (props.action === 'SHOW' || props.action === 'EDIT') {
      router.push('/vehiculos');
    }
  }
  isLoading.value = false;
};

// Nueva función para cargar las inoperatividades del vehículo
const loadInoperatividades = async () => {
  if (!props.vehiculoId) return; // Solo carga si hay un vehiculoId
  const res = await fetchVehiculoInoperatividades(props.vehiculoId);
  if (res.success) {
    inoperatividades.value = res.data;
  } else {
    giveMeASnack({ message: res.message, color: 'error' });
  }
};

// Función específica para navegar a detalles (desde EDIT)
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
  // Si estamos en modo SHOW o EDIT, cargar el vehículo y sus inoperatividades
  if (props.vehiculoId && (props.action === 'SHOW' || props.action === 'EDIT')) {
    await loadVehiculo();
    await loadInoperatividades();
  }
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

// Handlers para el formulario de VEHÍCULO principal
const handleMainButtonClick = async () => {
  if (btnTitle.value === 'Editar') {
    router.push(`/vehiculos/edit/${props.vehiculoId}`);
    return;
  }
  if (!(await form.value.validate()).valid) return giveMeASnack({ message: 'Formulario inválido', color: 'error' });

  isLoading.value = true;
  const payload = { ...formData.value };
  payload.ano = parseInt(formData.value.ano, 10);
  // Asegúrate que ficav se envíe como string en el formato correcto 'YYYY-MM-DD'
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


// NUEVA LÓGICA PARA GESTIONAR INOPERATIVIDADES

// Abrir el diálogo para añadir una nueva inoperatividad
const openAddInoperatividadDialog = () => {
  inoperatividadToEdit.value = null; // No hay inoperatividad para editar, es nueva
  showInoperatividadDialog.value = true;
};

// Abrir el diálogo para editar una inoperatividad existente
const openEditInoperatividadDialog = (inoperatividad) => {
  inoperatividadToEdit.value = inoperatividad;
  showInoperatividadDialog.value = true;
};

// Función que se llama cuando una inoperatividad ha sido guardada o actualizada
const handleInoperatividadSaved = async () => {
  showInoperatividadDialog.value = false; // Cierra el diálogo
  await loadInoperatividades(); // Recarga la lista de inoperatividades
  await loadVehiculo(); // Recarga los detalles del vehículo para actualizar su estado técnico
};

// Confirmar la eliminación de una inoperatividad específica
const confirmDeleteInoperatividad = (id) => {
  inoperatividadToDeleteId.value = id;
  showConfirmDeleteInoperatividad.value = true;
};

// Manejar la eliminación de una inoperatividad
const handleDeleteInoperatividad = async () => {
  isLoading.value = true;
  const res = await deleteVehiculoInoperatividad(inoperatividadToDeleteId.value);
  isLoading.value = false;

  if (res.success) {
    giveMeASnack({ message: 'Inoperatividad eliminada con éxito.', color: 'success' });
    await loadInoperatividades(); // Recarga la lista
    await loadVehiculo(); // Recarga el vehículo para que se actualice el estado técnico
    showConfirmDeleteInoperatividad.value = false;
  } else {
    giveMeASnack({ message: res.message, color: 'error' });
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
          <VBtn variant="outlined" prepend-icon="ri-arrow-left-line" @click="router.push('/vehiculos')"
            color="secondary">Atrás</VBtn>
          <v-btn v-if="props.action !== 'SHOW'" type="submit">{{ btnTitle }}</v-btn>
          <v-btn v-else type="submit">{{ btnTitle }}</v-btn>
          <v-btn v-if="props.action !== 'CREATE' && props.action !== 'SHOW'" variant="outlined"
            @click="goToProductDetails()">
            Cancelar
          </v-btn>

          <!-- Diálogo de confirmación de eliminación del VEHÍCULO principal -->
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
              <VAutocomplete v-model="formData.chofer_id" :items="choferes" item-title="nombre" item-value="id"
                label="Chofer" clearable :readonly="!canWrite" />
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
        <div class="d-flex justify-center mt-5 ">
          <v-btn v-if="props.action === 'EDIT'" icon="ri-delete-bin-line" color="error" variant="outlined"
            @click="toogleShowConfirmDelete"></v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- SECCIÓN DE HISTORIAL DE INOPERATIVIDADES -->
    <v-row v-if="props.vehiculoId">
      <v-col cols="12">
        <v-card class="mt-8">
          <v-card-title class="d-flex justify-space-between align-center">
            Historial de Inoperatividades
            <v-btn v-if="props.action === 'EDIT'" color="primary" @click="openAddInoperatividadDialog">
              Registrar Nueva Inoperatividad
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table :headers="[
              { title: 'Fecha Salida', key: 'fecha_salida_servicio' },
              { title: 'Fecha Reanudación', key: 'fecha_reanudacion_servicio' },
              { title: 'Motivo', key: 'motivo_averia' },
              // La columna 'Acciones' solo se incluye si action es 'EDIT'
              ...(props.action === 'EDIT' ? [{ title: 'Acciones', key: 'actions', sortable: false }] : []),
            ]" :items="inoperatividades" class="elevation-1" :loading="isLoading"
              loading-text="Cargando inoperatividades...">
              <template #item.fecha_salida_servicio="{ item }">
                {{ item.fecha_salida_servicio ? new Date(item.fecha_salida_servicio).toLocaleDateString() : 'N/A' }}
              </template>
              <template #item.fecha_reanudacion_servicio="{ item }">
                {{ item.fecha_reanudacion_servicio ? new Date(item.fecha_reanudacion_servicio).toLocaleDateString() :
                  'Activo' }}
              </template>
              <template v-if="props.action === 'EDIT'" #item.actions="{ item }">
                <v-icon small class="me-2" @click="openEditInoperatividadDialog(item)">ri-pencil-line</v-icon>
                <v-icon small @click="confirmDeleteInoperatividad(item.id)">ri-delete-bin-line</v-icon>
              </template>
              <template #no-data>
                <p class="text-center my-4">No hay inoperatividades registradas para este vehículo.</p>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Componente de Diálogo para Inoperatividades -->
    <VehiculoInoperatividadDialog :is-visible="showInoperatividadDialog" :vehiculo-id="props.vehiculoId"
      :inoperatividad-to-edit="inoperatividadToEdit" @update:is-visible="showInoperatividadDialog = $event"
      @inoperatividad-saved="handleInoperatividadSaved" />

    <!-- Diálogo de Confirmación de Eliminación para Inoperatividades -->
    <v-dialog width="auto" v-model="showConfirmDeleteInoperatividad">
      <ConfirmDeleteDialog @cancel="showConfirmDeleteInoperatividad = false" @confirm="handleDeleteInoperatividad" />
    </v-dialog>
  </v-form>
</template>

<style scoped>
/* Agrega cualquier estilo específico aquí si es necesario */
</style>