<script setup>
import { onMounted, ref, watch, computed, inject } from 'vue' // Added 'inject' and 'computed'
import {
  fetchChoferNames,
  fetchTipoCombustibleNames,
  fetchVechicles,
  updateVehicle, // Assuming this is used elsewhere
  fetchCdtReport // <--- IMPORT THE NEW FUNCTION HERE
} from './index'
import { debounce } from 'lodash';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay() // Obtiene las propiedades de pantalla

const giveMeASnack = inject('Snackbar:giveMeASnack')

// Puedes definir una propiedad que determine si el dispositivo es móvil
const isMobile = computed(() => mobile.value)

// Data table
const headers = ref([
  { title: "numero interno", text: "numero_interno", value: "numero_interno" },
  { title: "marca", text: "marca", value: "marca" },
  { title: "modelo", text: "modelo", value: "modelo" },
  { title: "Tipo", text: "tipo_vehiculo", value: "tipo_vehiculo" },
  { title: "Año ", text: "ano", value: "ano" },
  { title: "tipo combustible", text: "tipo_combustible_id", value: "tipo_combustible_id", align: 'center' },
  { title: "indice consumo", text: "indice_consumo", value: "indice_consumo" },
  { title: "prueba litro", text: "prueba_litro", value: "prueba_litro" },
  { title: "ficav", text: "ficav", value: "ficav", align: 'center' },
  { title: "capacidad tanque", text: "capacidad_tanque", value: "capacidad_tanque", align: 'center' },
  { title: "color", text: "color", value: "color" },
  { title: "numero motor", text: "numero_motor", value: "numero_motor" },
  { title: "numero chasis", text: "numero_chasis", value: "numero_chasis" },
  { title: "chofer", text: "chofer_id", value: "chofer_id" },
  { title: "estado tecnico", text: "estado_tecnico", value: "estado_tecnico" },
  { title: 'Actions', key: 'actions', sortable: false, },
]);

// Debounce para la búsqueda en tiempo real (300ms de delay)
const debouncedSearch = debounce(() => {
  getVehiculos() // Debe llamarse sin parámetros
}, 300)

// Manejar cambios en el input de búsqueda
const onSearchInput = () => {
  pagination.value.page = 1; // Resetear a la primera página
  debouncedSearch();
};

const vehiculos = ref([])
const totalProduct = ref(0)

// Data table options
const pagination = ref({ page: 1, itemsPerPage: 20, sortBy: null, orderBy: null });
const updateOptions = options => {
  pagination.value.sortBy = options.sortBy[0]?.key
  pagination.value.orderBy = options.sortBy[0]?.order
  pagination.value.page = options.page
  pagination.value.itemsPerPage = options.itemsPerPage
  getVehiculos()
}

// Filters
const search = ref("");
const loading = ref(false);

const choferes = ref([]);
const tiposCombustible = ref([]);
const estadoTecnico = ref([]);
const tiposVehiculo = ref([]);


const selectedChofer = ref(null);
const selectedTipoCombustible = ref(null);
const selectedEstadoTecnico = ref(null);
const selectedTipoVehiculo = ref(null);

// Functions to load data
const getVehiculos = async () => {
  loading.value = true;
  const response = await fetchVechicles(
    pagination.value.page,
    pagination.value.itemsPerPage,
    search.value,
    selectedChofer.value?.id ?? selectedChofer.value,
    selectedTipoCombustible.value?.id ?? selectedTipoCombustible.value,
    selectedEstadoTecnico.value?.id ?? selectedEstadoTecnico.value,
    selectedTipoVehiculo.value?.id ?? selectedTipoVehiculo.value
  );

  if (!response.success) {
    giveMeASnack({ message: response.message, color: 'error' });
    return;
  }

  vehiculos.value = response.data.map((item) => {
    return { ...item };
  });

  totalProduct.value = response.meta.total;
  loading.value = false;
}

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
    const res = await fetchTipoCombustibleNames();
    if (res.success) tiposCombustible.value = res.data;
    else throw new Error(res.message);
  } catch {
    giveMeASnack({ message: 'Error cargando tipos de combustible', color: 'error' });
  }
};

const loadEstadosTecnicos = async () => {
  estadoTecnico.value = [
    { id: 'activo', nombre: 'Activo' },
    { id: 'paralizado', nombre: 'Paralizado' },
  ];
};

const loadTiposVehiculos = async () => {
  tiposVehiculo.value = [
    { id: 'auto', nombre: 'Auto' },
    { id: 'camioneta', nombre: 'Camioneta' },
  ];
};

// Functions to format data
const formatEstadoTecnico = (estado) => {
  if (!estado) return 'Desconocido'
  return estado
    .replace(/_/g, ' ') // Cambia guiones por espacios
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitaliza cada palabra
}

const router = useRouter();

// Navigation functions
const goToProductDetails = (vehicleId) => {
  router.push(`/vehiculos/details/${vehicleId}`);
};
const goToProductEdit = (vehicleId) => {
  router.push(`/vehiculos/edit/${vehicleId}`);
};

// --- CDT Report Generation Functionality ---
const showCdtReportDialog = ref(false);
const cdtReportYear = ref(new Date().getFullYear());
const cdtReportMonth = ref(new Date().getMonth() + 1); // Month is 0-indexed
const cdtReportSelectedVehicle = ref(null); // Used for specific vehicle report

// Generate arrays for year and month selection
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  const yearsArray = [];
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    yearsArray.push(i);
  }
  return yearsArray;
});

const months = ref([
  { id: 1, name: 'Enero' },
  { id: 2, name: 'Febrero' },
  { id: 3, name: 'Marzo' },
  { id: 4, name: 'Abril' },
  { id: 5, name: 'Mayo' },
  { id: 6, name: 'Junio' },
  { id: 7, name: 'Julio' },
  { id: 8, name: 'Agosto' },
  { id: 9, name: 'Septiembre' },
  { id: 10, name: 'Octubre' },
  { id: 11, name: 'Noviembre' },
  { id: 12, name: 'Diciembre' },
]);

const generateCdtReport = async () => {
  if (!cdtReportYear.value || !cdtReportMonth.value) {
    giveMeASnack({ message: 'Por favor, selecciona el año y el mes para el reporte.', color: 'warning' });
    return;
  }

  showCdtReportDialog.value = false; // Close the dialog immediately
  giveMeASnack({ message: 'Generando reporte CDT...', color: 'info' });

  const result = await fetchCdtReport(
    cdtReportYear.value,
    cdtReportMonth.value,
    cdtReportSelectedVehicle.value?.id // Pass vehicle ID if selected
  );

  if (result.success) {
    // Message will be handled by the fetchCdtReport function via snackbar due to PDF download logic
  } else {
    giveMeASnack({ message: result.message, color: 'error' });
  }
};
// --- END CDT Report Generation Functionality ---

// Watchers
watch([selectedChofer, selectedTipoCombustible, selectedEstadoTecnico, selectedTipoVehiculo], () => {
  getVehiculos();
});

watch(search, () => {
  debouncedSearch()
})

onMounted(() => {
  getVehiculos()
  loadChoferes();
  loadTiposCombustible();
  loadEstadosTecnicos();
  loadTiposVehiculos();
})

</script>

<template>
  <div>
    <VDialog v-model="showCdtReportDialog" max-width="500px">
      <VCard>
        <VCardTitle class="headline">Generar Reporte CDT</VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12" sm="6">
              <VSelect v-model="cdtReportYear" :items="years" label="Año" required />
            </VCol>
            <VCol cols="12" sm="6">
              <VSelect v-model="cdtReportMonth" :items="months" item-title="name" item-value="id" label="Mes"
                required />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="red darken-1" text @click="showCdtReportDialog = false">Cancelar</VBtn>
          <VBtn color="primary" @click="generateCdtReport">Generar</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VCard title="Filtros">
      <VCardText>
        <VRow>
          <VCol cols="12" sm="3">
            <VSelect v-model="selectedTipoVehiculo" :items="tiposVehiculo" item-title="nombre" item-value="id"
              label="Tipo de vehículo" clearable />
          </VCol>

          <VCol cols="12" sm="3">
            <VAutocomplete v-model="selectedChofer" :items="choferes" item-title="nombre" item-value="id" label="Chofer"
              clearable return-object />
          </VCol>

          <VCol cols="12" sm="3">
            <VSelect v-model="selectedTipoCombustible" :items="tiposCombustible" item-title="nombre" item-value="id"
              label="Tipo combustible" clearable />
          </VCol>

          <VCol cols="12" sm="3">
            <VSelect v-model="selectedEstadoTecnico" :items="estadoTecnico" item-title="nombre" item-value="id"
              label="Estado técnico" clearable />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex justify-space-between gap-4">
        <VRow>
          <v-col cols="12" sm="6" md="6">
            <v-text-field v-model="search" @input="onSearchInput" placeholder="Buscar productos" density="compact"
              prepend-inner-icon="ri-search-line" clearable />
          </v-col>

          <!-- Botón Generar Reporte CDT: ocupa 12 en xs, 6 en sm, 4 en md -->
          <v-col cols="12" sm="6" md="3" class="d-flex justify-center justify-sm-end">
            <v-btn color="primary" prepend-icon="ri-file-chart-line" @click="showCdtReportDialog = true">
              Generar Reporte CDT
            </v-btn>
          </v-col>

          <!-- Botón Añadir Vehículo: ocupa 12 en xs, 12 en sm y 4 en md -->
          <v-col cols="12" sm="12" md="3" class="d-flex justify-center justify-md-end">
            <v-btn color="primary" :block="isMobile" prepend-icon="ri-add-line" @click="$router.push('/vehiculos/add')">
              Añadir Vehículo
            </v-btn>
          </v-col>
        </VRow>
      </VCardText>

      <VDataTableServer :items-per-page="pagination.itemsPerPage" :page="pagination.page" :headers="headers"
        :loading="loading" loading-text="Cargando..." :items="vehiculos" :items-length="totalProduct"
        class="text-no-wrap rounded-0" @update:options="updateOptions">

        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

        <template #item.estado_tecnico="{ item }">
          <span>{{ formatEstadoTecnico(item.estado_tecnico) }}</span>
        </template>

        <template #item.actions="{ item }">
          <v-btn variant="text" icon="ri-eye-line" @click="goToProductDetails(item.id)"></v-btn>
          <v-btn variant="text" @click="goToProductEdit(item.id)" icon="ri-edit-box-line"></v-btn>
        </template>

      </VDataTableServer>
    </VCard>
  </div>
</template>

<style>
.cl {
  color: #d7b36b
}
</style>