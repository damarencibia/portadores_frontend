<script setup>
import { onMounted, ref, watch, inject } from 'vue' // Asegúrate de importar inject
import { fetchChoferNames, fetchTipoCombustibles, fetchWithdrawals, fetchTarjetas, fetchUsersByEnterprise } from './index' // Changed fetchCharges to fetchWithdrawals
import { submitRetiroCombustible } from '@/views/pages/tarjetas/TarjetaForm' // Assuming you'll have a submitRetiroCombustible function
import RetiroCombustibleDialog from '@/pages/components/RetiroCombustibleDialog.vue' // New dialog component for withdrawals
import SelectTarjetaDialog from '@/pages/components/SelectTarjetaDialog.vue'
import { getStoredUser } from '@/utils/api'
import { debounce } from 'lodash';
import { useRouter } from 'vue-router';

const giveMeASnack = inject('Snackbar:giveMeASnack')

//data table
// const headers = ref([
//   // Ajuste en el título si el registro está eliminado
//   { title: "estado", text: "estado", value: "estado" },
//   { title: "fecha", text: "fecha", value: "fecha" },
//   { title: "hora", text: "hora", value: "hora" },
//   { title: "lugar", text: "lugar", value: "lugar" },
//   { title: "tarjeta", text: "tarjeta_combustible", value: "tarjeta_combustible" },
//   { title: "cantidad", text: "cantidad", value: "cantidad" },
//   { title: "combustible", text: "tipo_combustible", value: "tipo_combustible" },
//   { title: "odómetro", text: "odometro", value: "odometro" },
//   { title: "chip", text: "no_chip", value: "no_chip" },
//   { title: "chofer", text: "chofer", value: "chofer" },
//   { title: "registrador", text: "registrado_por", value: "registrado_por" },
//   { title: 'Actions', key: 'actions', sortable: false, },
// ]);

// --- Helpers para iconos y colores según estado (AHORA INCLUYEN LÓGICA PARA 'DELETED_AT') ---
const estadoIcon = (item) => {
  if (item.eliminado) { // Si hay un valor en deleted_at, significa que está eliminado lógicamente
    return 'ri-delete-bin-line'; // Ícono para eliminado
  }
  switch (item.estado) {
    case 'pendiente':
      return 'ri-time-line';
    case 'validada':
      return 'ri-checkbox-circle-line';
    case 'rechazada':
      return 'ri-close-circle-line';
    default:
      return 'ri-question-line';
  }
}

const estadoColor = (item) => {
  if (item.deleted_at) { // Si hay un valor en deleted_at, significa que está eliminado lógicamente
    return 'secondary'; // Color para eliminado (puedes elegir 'grey', 'purple', etc.)
  }
  switch (item.estado) {
    case 'pendiente':
      return 'warning';
    case 'validada':
      return 'success';
    case 'rechazada':
      return 'error';
    default:
      return 'grey';
  }
}

// Debounce para la búsqueda en tiempo real (300ms de delay)
const debouncedSearch = debounce(() => {
  getWithdrawals() // Changed function call
}, 300)

// Manejar cambios en el input de búsqueda
const onSearchInput = () => {
  pagination.value.page = 1; // Resetear a la primera página
  debouncedSearch();
};

const withdrawals = ref([]) // Changed from charges to withdrawals
const totalProduct = ref(0)

// Data table options
const pagination = ref({ page: 1, itemsPerPage: 20, sortBy: null, orderBy: null });
const updateOptions = options => {
  pagination.value.sortBy = options.sortBy[0]?.key
  pagination.value.orderBy = options.sortBy[0]?.order
  pagination.value.page = options.page
  pagination.value.itemsPerPage = options.itemsPerPage
  getWithdrawals() // Changed function call
}

//filters
const search = ref("");
const loading = ref(false);

const choferes = ref([]);
const tiposCombustible = ref([]);
const listaTarjetas = ref([]);
const listaUsuarios = ref([]);
const mostrarEliminados = ref(false);

const selectedChofer = ref(null);
const selectedTipoCombustible = ref(null);
const selectedTarjeta = ref(null);
const selectedUsuario = ref(null);

//functiones load
const getWithdrawals = async () => { // Changed function name
  loading.value = true;
  const response = await fetchWithdrawals( // Changed fetchCharges to fetchWithdrawals
    pagination.value.page,
    pagination.value.itemsPerPage,
    search.value,
    selectedTarjeta.value?.id ?? selectedTarjeta.value,
    selectedChofer.value?.id ?? selectedChofer.value,
    selectedTipoCombustible.value?.id ?? selectedTipoCombustible.value,
    selectedUsuario.value?.id ?? selectedUsuario.value,
    mostrarEliminados.value ? 1 : 0,
  );

  if (!response.success) {
    giveMeASnack({ message: response.message, color: 'error' });
    return;
  }

  withdrawals.value = response.data.map((item) => { // Changed charges to withdrawals
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
    giveMeASnack({ message: 'Error cargando tarjetas de combustible', color: 'error' }); // Adjusted message
  }
};

const loadUsuarios = async () => {
  try {
    const res = await fetchUsersByEnterprise();
    if (res.success) listaUsuarios.value = res.data;
    else throw new Error(res.message);
    console.log(listaUsuarios.value);

  } catch {
    giveMeASnack({ message: 'Error cargando usuarios', color: 'error' }); // Adjusted message
  }
};

const router = useRouter();

const goToWithdrawalsEdit = (withdrawalId) => { // Changed function name and route
  router.push(`/retiros/edit/${withdrawalId}`); // Changed route
};

// observadores
watch([selectedChofer, selectedTipoCombustible, selectedTarjeta, selectedUsuario, mostrarEliminados], () => {
  getWithdrawals(); // Changed function call
});

watch(search, () => {
  debouncedSearch()
})

/* variables pertenecientes a RetiroCombustibleDialog**************************/ // Changed comment
const showTarjetaSelectDialog = ref(false)
const showRetiroDialog = ref(false) // Changed showCargaDialog to showRetiroDialog
const tarjetaSeleccionada = ref(null) // objeto completo
const userId = ref(getStoredUser()?.id || null)
const userRole = ref(null); // This will hold the actual role string from API

const formData = ref({
  tipo_combustible_id: null,
  cantidad_combustible_actual: null,
  precioCombustible: null
})

// Cuando se confirme la tarjeta, abre el diálogo de retiro // Changed comment
const onTarjetaSeleccionada = (tarjeta) => {
  tarjetaSeleccionada.value = tarjeta
  formData.value.tipo_combustible_id = tarjeta.tipo_combustible_id
  formData.value.cantidad_combustible_actual = tarjeta.cantidad_actual
  formData.value.precioCombustible = tarjeta.saldo_monetario_actual
  showTarjetaSelectDialog.value = false
  console.log(tarjetaSeleccionada.value);

  showRetiroDialog.value = true // Changed showCargaDialog to showRetiroDialog
}

// Registrar retiro de combustible // Changed comment
const registrarRetiro = async (payload) => { // Changed function name
  const res = await submitRetiroCombustible(payload); // Changed submitCargaCombustible to submitRetiroCombustible
  if (res.success) {
    giveMeASnack({ message: 'Retiro registrado correctamente', color: 'success' }); // Adjusted message
    showRetiroDialog.value = false // Changed showCargaDialog to showRetiroDialog

    // 👇 Recarga los retiros después de registrar // Adjusted comment
    getWithdrawals() // Changed function call
  } else {
    giveMeASnack({ message: res.message, color: 'error' });
  }
};
/*****************************************************************************/


onMounted(async () => {
  console.log(`🚀 [Cargas/index] Componente montado.`);

  // 1. Fetch user profile first to get the role
  try {
    const userProfileData = await getUserProfile();
    if (userProfileData && userProfileData.roles) {
      userRole.value = userProfileData.roles;
      console.log("User role obtained:", userRole.value);
    } else {
      console.log("User profile or roles not found. Defaulting to null role.");
      userRole.value = null;
    }
  } catch (error) {
    console.error("Failed to fetch user profile on mount:", error);
    userRole.value = null; // Ensure role is null on error
  }

  // 2. Load initial data for filters (these don't depend on userRole for their initial fetch)
  // You can run these concurrently as they are independent fetches.
  await Promise.all([
    getWithdrawals(), // Changed function call
    loadChoferes(),
    loadTiposCombustible(),
    loadTarjetas(),
    loadUsuarios(),
    getCharges(),
  ]);

  // 3. Finally, fetch charges. This might depend on 'mostrarEliminados' which itself depends on 'userRole'
  // (via v-if in template). So calling it last ensures all other reactive data is ready.


  console.log(`✅ [Cargas/index] Initial data loading complete.`);
})

</script>

<template>
  <div>
    <VCard title="Filtros de Salidas de Combustible">
      <VCardText>
        <VRow>
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
            <VTextField v-model="search" @input="onSearchInput" placeholder="Buscar retiros" density="compact"
              prepend-inner-icon="ri-search-line" clearable />
          </VCol>
          <v-col cols="12" md="3">
            <v-switch v-if="userRole === 'supervisor'" v-model="mostrarEliminados" label="Ver eliminados"
              color="primary" @change="getWithdrawals" inset density="compact" /> </v-col>

          <VCol class="d-flex justify-end" cols="12" sm="3">
            <VBtn color="primary" prepend-icon="ri-add-line" @click="showTarjetaSelectDialog = true">
              Añadir Retiro </VBtn>

            <SelectTarjetaDialog v-model="showTarjetaSelectDialog" :tarjetas="listaTarjetas"
              @select="onTarjetaSeleccionada" @cancel="showTarjetaSelectDialog = false" clearable />

            <v-dialog v-model="showRetiroDialog" width="auto">
              <RetiroCombustibleDialog :tarjetaId="tarjetaSeleccionada?.id" :registradoPorId="userId"
                :cantidadActual="formData.cantidad_combustible_actual" @cancel="showRetiroDialog = false"
                @confirm="registrarRetiro" />
            </v-dialog>


          </VCol>
        </VRow>
      </VCardText>

      <VDataTableServer :headers="[
        { title: 'estado', key: 'estado' },
        { title: 'fecha', key: 'fecha' },
        { title: 'hora', key: 'hora' },
        { title: 'lugar', key: 'lugar' },
        { title: 'tarjeta', key: 'tarjeta_combustible' },
        { title: 'cantidad', key: 'cantidad' },
        { title: 'combustible', key: 'tipo_combustible' },
        { title: 'odómetro', key: 'odometro' },
        { title: 'chip', key: 'no_chip' },
        { title: 'chofer', key: 'chofer' },
        { title: 'registrador', key: 'registrado_por' },

        ...(userRole === 'supervisor' ? [{ title: 'Acciones', key: 'actions', sortable: false }] : []),
      ]" :items-per-page="pagination.itemsPerPage" :page="pagination.page" :loading="loading"
        loading-text="Cargando..." :items="withdrawals" :items-length="totalProduct" class="text-no-wrap rounded-0"
        @update:options="updateOptions"> <template v-slot:loading :headers="[
          ...(userRole === 'supervisor' ? [{ title: 'Acciones', key: 'actions', sortable: false }] : []),
        ]">
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

        <template #item.estado="{ item }">
          <div class="d-flex align-center">
            <v-icon :color="estadoColor(item)" class="mr-2" size="20">
              {{ estadoIcon(item) }}
            </v-icon>
            <v-tooltip activator="parent" location="end">
              <span :style="{ color: estadoColor(item) }">
                {{ item.deleted_at ? 'Eliminada' : (item.estado.charAt(0).toUpperCase() + item.estado.slice(1)) }}
              </span>
            </v-tooltip>
          </div>
        </template>

        <template v-if="userRole === 'supervisor'" #item.fecha="{ item }">
          <span :class="{ 'font-weight-black': item.accessed === false || item.accessed === 0 }">
            {{ item.fecha }}
          </span>
        </template>
        <template v-if="userRole === 'supervisor'" #item.hora="{ item }">
          <span :class="{ 'font-weight-black': item.accessed === false || item.accessed === 0 }">
            {{ item.hora }}
          </span>
        </template>
        <template v-if="userRole === 'supervisor'" #item.lugar="{ item }">
          <span :class="{ 'font-weight-black': item.accessed === false || item.accessed === 0 }">
            {{ item.lugar }}
          </span>
        </template>
        <template v-if="userRole === 'supervisor'" #item.tarjeta_combustible="{ item }">
          <span :class="{ 'font-weight-black': item.accessed === false || item.accessed === 0 }">
            {{ item.tarjeta_combustible }}
          </span>
        </template>
        <template v-if="userRole === 'supervisor'" #item.cantidad="{ item }">
          <span :class="{ 'font-weight-black': item.accessed === false || item.accessed === 0 }">
            {{ item.cantidad }}
          </span>
        </template>
        <template v-if="userRole === 'supervisor'" #item.tipo_combustible="{ item }">
          <span :class="{ 'font-weight-black': item.accessed === false || item.accessed === 0 }">
            {{ item.tipo_combustible }}
          </span>
        </template>
        <template v-if="userRole === 'supervisor'" #item.odometro="{ item }">
          <span :class="{ 'font-weight-black': item.accessed === false || item.accessed === 0 }">
            {{ item.odometro }}
          </span>
        </template>
        <template v-if="userRole === 'supervisor'" #item.no_chip="{ item }">
          <span :class="{ 'font-weight-black': item.accessed === false || item.accessed === 0 }">
            {{ item.no_chip }}
          </span>
        </template>
        <template v-if="userRole === 'supervisor'" #item.chofer="{ item }">
          <span :class="{ 'font-weight-black': item.accessed === false || item.accessed === 0 }">
            {{ item.chofer }}
          </span>
        </template>
        <template v-if="userRole === 'supervisor'" #item.registrado_por="{ item }">
          <span :class="{ 'font-weight-black': item.accessed === false || item.accessed === 0 }">
            {{ item.registrado_por }}
          </span>
        </template>

        <template v-if="userRole === 'supervisor'" #item.actions="{ item }">
          <v-btn variant="text" @click="goToWithdrawalsEdit(item.id)" icon="ri-eye-line"></v-btn> </template>

      </VDataTableServer>
    </VCard>


  </div>
</template>