<script setup>
import { onMounted, ref, watch } from 'vue'
import { fetchChoferNames, fetchTipoCombustibleNames, fetchVechicles, updateVehicle } from './index'
import { debounce } from 'lodash';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay() // Obtiene las propiedades de pantalla

const giveMeASnack = inject('Snackbar:giveMeASnack')

// Puedes definir una propiedad que determine si el dispositivo es móvil 
const isMobile = computed(() => mobile.value)

//data table
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

//filters
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

//functiones load
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
    // console.log('Vehiculo:', item); // 👈 verifica si viene `id`
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
    console.log(tiposCombustible.value);

  } catch {
    giveMeASnack({ message: 'Error cargando tipos de combustible', color: 'error' });
  }
};

const loadEstadosTecnicos = async () => {
  estadoTecnico.value = [
    { id: 'activo', nombre: 'Activo' },
    { id: 'paralizado', nombre: 'Paralizado' },
    { id: 'en_reparacion', nombre: 'En reparación' }
  ];
};

const loadTiposVehiculos = async () => {
  tiposVehiculo.value = [
    { id: 'auto', nombre: 'Auto' },
    { id: 'camioneta', nombre: 'Camioneta' },
  ];
};



// funciones map
const formatEstadoTecnico = (estado) => {
  if (!estado) return 'Desconocido'
  return estado
    .replace(/_/g, ' ') // Cambia guiones por espacios
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitaliza cada palabra
}

const router = useRouter();

// Función específica para navegar a detalles
const goToProductDetails = (vehicleId) => {
  router.push(`/vehiculos/details/${vehicleId}`);
};
const goToProductEdit = (vehicleId) => {
  router.push(`/vehiculos/edit/${vehicleId}`);
};

// observadores
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
    <!-- 👉 vehiculos -->
    <VCard title="Filtros">
      <VCardText>
        <VRow>
          <!-- 👉 Select Tipo Vehiculo -->
          <VCol cols="12" sm="3">
            <VSelect v-model="selectedTipoVehiculo" :items="tiposVehiculo" item-title="nombre" item-value="id"
              label="Tipo de vehículo" clearable />
          </VCol>

          <!-- 👉 Select Chofer -->
          <VCol cols="12" sm="3">
            <VAutocomplete v-model="selectedChofer" :items="choferes" item-title="nombre" item-value="id" label="Chofer"
              clearable return-object />
          </VCol>

          <!-- 👉 Select Tipo Combustible -->
          <VCol cols="12" sm="3">
            <VSelect v-model="selectedTipoCombustible" :items="tiposCombustible" item-title="nombre" item-value="id"
              label="Tipo combustible" clearable />
          </VCol>

          <!-- 👉 Select Estado Tecnico -->
          <VCol cols="12" sm="3">
            <VSelect v-model="selectedEstadoTecnico" :items="estadoTecnico" item-title="nombre" item-value="id"
              label="Estado técnico" clearable />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex justify-space-between gap-4">
        <VRow class="w-100">
          <VCol cols="12" sm="6">
            <!-- 👉 Search  -->
            <VTextField v-model="search" @input="onSearchInput" placeholder="Buscar productos" density="compact"
              prepend-inner-icon="ri-search-line" clearable />
          </VCol>
          <VCol class="d-flex w-100 justify-end" cols="12" sm="6">
            <VBtn color="primary" :block="isMobile" prepend-icon="ri-add-line" @click="$router.push('/vehiculos/add')">
              Añadir Vehiculo
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <!-- 👉 Datatable  -->
      <VDataTableServer :items-per-page="pagination.itemsPerPage" :page="pagination.page" :headers="headers"
        :loading="loading" loading-text="Cargando..." :items="vehiculos" :items-length="totalProduct"
        class="text-no-wrap rounded-0" @update:options="updateOptions">

        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

        <template #item.estado_tecnico="{ item }">
          <span>{{ formatEstadoTecnico(item.estado_tecnico) }}</span>
        </template>

        <!-- Actions -->
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
