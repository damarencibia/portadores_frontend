<script setup>
import { onMounted, ref, watch } from 'vue'
import { fetchChoferNames, fetchTipoCombustibles, fetchCharges, fetchTarjetas, fetchUsersByEnterprise } from './index'
import { submitCargaCombustible } from '@/views/pages/tarjetas/TarjetaForm'
import CargaCombustibleDialog from '@/pages/components/CargaCombustibleDialog.vue'
import SelectTarjetaDialog from '@/pages/components/SelectTarjetaDialog.vue'
import { getStoredUser } from '@/utils/api'
import { debounce } from 'lodash';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay() // Obtiene las propiedades de pantalla

const giveMeASnack = inject('Snackbar:giveMeASnack')

// Puedes definir una propiedad que determine si el dispositivo es móvil 
const isMobile = computed(() => mobile.value)

//data table
const headers = ref([
  { title: "fecha", text: "fecha", value: "fecha" },
  { title: "hora", text: "hora", value: "hora" },
  { title: "lugar", text: "lugar", value: "lugar" },
  { title: "tarjeta", text: "tarjeta_combustible", value: "tarjeta_combustible" },
  { title: "cantidad", text: "cantidad", value: "cantidad" },
  { title: "combustible", text: "tipo_combustible", value: "tipo_combustible" },
  { title: "odómetro", text: "odometro", value: "odometro" },
  { title: "chip", text: "no_chip", value: "no_chip" },
  { title: "chofer", text: "chofer", value: "chofer" },
  { title: "registrador", text: "registrado_por", value: "registrado_por" },
  { title: 'Actions', key: 'actions', sortable: false, },
]);

// Debounce para la búsqueda en tiempo real (300ms de delay)
const debouncedSearch = debounce(() => {
  getCharges() // Debe llamarse sin parámetros
}, 300)

// Manejar cambios en el input de búsqueda
const onSearchInput = () => {
  pagination.value.page = 1; // Resetear a la primera página
  debouncedSearch();
};

const charges = ref([])
const totalProduct = ref(0)

// Data table options
const pagination = ref({ page: 1, itemsPerPage: 20, sortBy: null, orderBy: null });
const updateOptions = options => {
  pagination.value.sortBy = options.sortBy[0]?.key
  pagination.value.orderBy = options.sortBy[0]?.order
  pagination.value.page = options.page
  pagination.value.itemsPerPage = options.itemsPerPage
  getCharges()
}

//filters
const search = ref("");
const loading = ref(false);

const choferes = ref([]);
const tiposCombustible = ref([]);
const listaTarjetas = ref([]);
const listaUsuarios = ref([]);

const selectedChofer = ref(null);
const selectedTipoCombustible = ref(null);
const selectedTarjeta = ref(null);
const selectedUsuario = ref(null);

//functiones load
const getCharges = async () => {
  loading.value = true;
  const response = await fetchCharges(
    pagination.value.page,
    pagination.value.itemsPerPage,
    search.value,
    selectedTarjeta.value?.id ?? selectedTarjeta.value,
    selectedChofer.value?.id ?? selectedChofer.value,
    selectedTipoCombustible.value?.id ?? selectedTipoCombustible.value,
    selectedUsuario.value?.id ?? selectedUsuario.value,
  );

  if (!response.success) {
    giveMeASnack({ message: response.message, color: 'error' });
    return;
  }

  charges.value = response.data.map((item) => {
    // console.log('Vehiculo:', item); // 👈 verifica si viene `id`
    return { ...item };
  });

  totalProduct.value = response.meta.total;
  loading.value = false;
}

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
    const res = await fetchTipoCombustibles();
    if (res.success) tiposCombustible.value = res.data;
    else throw new Error(res.message);
    console.log(tiposCombustible.value);

  } catch {
    giveMeASnack({ message: 'Error cargando tipos de combustible', color: 'error' });
  }
};

const loadTarjetas = async () => {
  try {
    const res = await fetchTarjetas();
    if (res.success) listaTarjetas.value = res.data;
    else throw new Error(res.message);
    console.log(listaTarjetas.value);

  } catch {
    giveMeASnack({ message: 'Error cargando tipos de combustible', color: 'error' });
  }
};

const loadUsuarios = async () => {
  try {
    const res = await fetchUsersByEnterprise();
    if (res.success) listaUsuarios.value = res.data;
    else throw new Error(res.message);
    console.log(listaUsuarios.value);

  } catch {
    giveMeASnack({ message: 'Error cargando tipos de combustible', color: 'error' });
  }
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
watch([selectedChofer, selectedTipoCombustible, selectedTarjeta, selectedUsuario], () => {
  getCharges();
});

watch(search, () => {
  debouncedSearch()
})

/* variables pertenecientes a CargaCombustibleDialog**************************/
const showTarjetaSelectDialog = ref(false)
const showCargaDialog = ref(false)
const tarjetaSeleccionada = ref(null) // objeto completo
const userId = ref(getStoredUser()?.id || null)

const formData = ref({
  tipo_combustible_id: null,
  saldo_monetario_actual: null,
  precioCombustible: null
})

// Cuando se confirme la tarjeta, abre el diálogo de carga
const onTarjetaSeleccionada = (tarjeta) => {
  tarjetaSeleccionada.value = tarjeta
  formData.value.tipo_combustible_id = tarjeta.tipo_combustible_id
  formData.value.saldo_monetario_actual = tarjeta.saldo_monetario_actual
  formData.value.precioCombustible = tarjeta.saldo_monetario_actual
  showTarjetaSelectDialog.value = false
  console.log(tarjetaSeleccionada.value);

  showCargaDialog.value = true
}

// Registrar carga de combustible
const registrarCarga = async (payload) => {
  const res = await submitCargaCombustible(payload);
  if (res.success) {
    giveMeASnack({ message: 'Carga registrada correctamente', color: 'success' });
    showCargaDialog.value = false
  
    // 👇 Recarga las cargas después de registrar
    getCharges()
  } else {
    giveMeASnack({ message: res.message, color: 'error' });
  }
};
/*****************************************************************************/


onMounted(() => {
  getCharges()
  loadChoferes();
  loadTiposCombustible();
  loadTarjetas();
  loadUsuarios();
})

</script>

<template>
  <div>
    <!-- 👉 charges -->
    <VCard title="Filtros">
      <VCardText>
        <VRow>
          <!-- 👉 Select Chofer -->
          <VCol cols="12" sm="3">
            <VAutocomplete v-model="selectedChofer" :items="choferes" item-title="nombre" item-value="id" label="Chofer"
              clearable return-object />
          </VCol>

          <VCol cols="12" sm="3">
            <VAutocomplete v-model="selectedTarjeta" :items="listaTarjetas" item-title="numero" item-value="id"
              label="Tarjetas" clearable />
          </VCol>

          <VCol cols="12" sm="3">
            <VAutocomplete v-model="selectedTipoCombustible" :items="tiposCombustible" item-title="nombre"
              item-value="id" label="Tipo Combustible" clearable />
          </VCol>

          <VCol cols="12" sm="3">
            <VAutocomplete v-model="selectedUsuario" :items="listaUsuarios" item-title="name" item-value="id"
              label="Registrador" clearable />
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
            <VBtn color="primary" class="ma-4" prepend-icon="ri-add-line" @click="showTarjetaSelectDialog = true">
              Añadir Carga
            </VBtn>

            <SelectTarjetaDialog v-model="showTarjetaSelectDialog" :tarjetas="listaTarjetas"
              @select="onTarjetaSeleccionada" @cancel="showTarjetaSelectDialog = false" clearable />

            <v-dialog v-model="showCargaDialog" width="auto">
              <CargaCombustibleDialog :tarjetaId="tarjetaSeleccionada?.id" :registradoPorId="userId"
                :saldoActual="formData.saldo_monetario_actual" @cancel="showCargaDialog = false"
                @confirm="registrarCarga" />
            </v-dialog>


          </VCol>
        </VRow>
      </VCardText>

      <!-- 👉 Datatable  -->
      <VDataTableServer :items-per-page="pagination.itemsPerPage" :page="pagination.page" :headers="headers"
        :loading="loading" loading-text="Cargando..." :items="charges" :items-length="totalProduct"
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
