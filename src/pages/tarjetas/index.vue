<script setup>
import { onMounted, ref, watch } from 'vue'
import { fetchChoferNames, fetchTipoCombustibleNames, fetchCards } from './index'
import { debounce } from 'lodash';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay() // Obtiene las propiedades de pantalla

const giveMeASnack = inject('Snackbar:giveMeASnack')

// Puedes definir una propiedad que determine si el dispositivo es móvil 
const isMobile = computed(() => mobile.value)

//data table
const headers = ref([
  { title: "Numero", text: "numero", value: "numero" },
  { title: "cantidad actual", text: "cantidad_actual", value: "cantidad_actual" },
  { title: "saldo maximo", text: "saldo_maximo", value: "saldo_maximo" },
  { title: "limite consumo mensual", text: "limite_consumo_mensual", value: "limite_consumo_mensual" },
  { title: "acumulado mensual", text: "consumo_cantidad_mensual_acumulado", value: "consumo_cantidad_mensual_acumulado" },
  { title: "tipo combustible", text: "tipo_combustible_id", value: "tipo_combustible_id"},
  { title: "fecha vencimiento", text: "fecha_vencimiento", value: "fecha_vencimiento" },
  { title: "activa", text: "activa", value: "activa"},
  { title: "Chofer", text: "chofer_id", value: "chofer_id"},
  { title: 'Actions', key: 'actions', sortable: false, },
]);

// Debounce para la búsqueda en tiempo real (300ms de delay)
const debouncedSearch = debounce(() => {
  getCards() // Debe llamarse sin parámetros
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
  getCards()
}

//filters
const search = ref("");
const loading = ref(false);

const choferes = ref([]);
const tiposCombustible = ref([]);
const activa = ref([]);

const selectedChofer = ref(null);
const selectedTipoCombustible = ref(null);
const selectedActiva= ref(null);

//functiones load
const getCards = async () => {
  loading.value = true;
  const response = await fetchCards(
    pagination.value.page,
    pagination.value.itemsPerPage,
    search.value,
    selectedChofer.value?.id ?? selectedChofer.value,
    selectedTipoCombustible.value?.id ?? selectedTipoCombustible.value,
    selectedActiva.value?.id ?? selectedActiva.value,
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

const loadActiva = async () => {
  activa.value = [
    { id: '1', nombre: 'Activa' },
    { id: '0', nombre: 'No Activa' },
  ];
};

const router = useRouter();

// Función específica para navegar a detalles
const goToTarjetaDetails = (tarjetaId) => {
  router.push(`/tarjetas/details/${tarjetaId}`);
};
const goToTarjetaEdit = (tarjetaId) => {
  router.push(`/tarjetas/edit/${tarjetaId}`);
};

// observadores
watch([selectedChofer, selectedTipoCombustible, selectedActiva], () => {
  getCards();
});

watch(search, () => {
  debouncedSearch()
})

onMounted(() => {
  getCards()
  loadChoferes();
  loadTiposCombustible();
  loadActiva();
})

</script>

<template>
  <div>
    <!-- 👉 vehiculos -->
    <VCard title="Filtros">
      <VCardText>
        <VRow>
          <!-- 👉 Select Chofer -->
          <VCol cols="12" sm="3">
            <VAutocomplete v-model="selectedChofer" :items="choferes" item-title="nombre" item-value="id" label="Chofer"
              clearable return-object />
          </VCol>

          <!-- 👉 Select Tipo Combustible -->
          <VCol cols="12" sm="3">
            <VSelect v-model="selectedActiva" :items="activa" item-title="nombre" item-value="id"
              label="Estado" clearable />
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
            <VBtn color="primary" :block="isMobile" prepend-icon="ri-add-line" @click="$router.push('/tarjetas/add')">
              Añadir Tarjeta
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

        <template #item.activa="{ item }">
          <span>{{ item.activa == 1 || item.activa === true ? 'Activa' : 'No Activa' }}</span>
        </template>        

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn variant="text" icon="ri-eye-line" @click="goToTarjetaDetails(item.id)"></v-btn>
          <v-btn variant="text" @click="goToTarjetaEdit(item.id)" icon="ri-edit-box-line"></v-btn>
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
