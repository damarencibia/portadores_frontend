<script setup>
import { onMounted, ref, watch, inject } from 'vue' // Asegúrate de importar inject
import { fetchChoferNames, fetchTipoCombustibles, fetchCharges, fetchTarjetas, fetchUsersByEnterprise } from './index'
import { submitCargaCombustible } from '@/views/pages/tarjetas/TarjetaForm'
import CargaCombustibleDialog from '@/pages/components/CargaCombustibleDialog.vue'
import SelectTarjetaDialog from '@/pages/components/SelectTarjetaDialog.vue'
import { getStoredUser } from '@/utils/api'
import { debounce } from 'lodash';
import { useRouter } from 'vue-router';

const giveMeASnack = inject('Snackbar:giveMeASnack')

//data table
const headers = ref([
  // Ajuste en el título si el registro está eliminado
  { title: "estado", text: "estado", value: "estado" },
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
const mostrarEliminados = ref(false);

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
    mostrarEliminados.value ? 1 : 0,
  );

  if (!response.success) {
    giveMeASnack({ message: response.message, color: 'error' });
    return;
  }

  charges.value = response.data.map((item) => {
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

const goToCargasEdit = (cargaId) => {
  router.push(`/cargas/edit/${cargaId}`);
};

// observadores
watch([selectedChofer, selectedTipoCombustible, selectedTarjeta, selectedUsuario, mostrarEliminados], () => {
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
    <VCard title="Filtros">
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
            <VTextField v-model="search" @input="onSearchInput" placeholder="Buscar registros" density="compact"
              prepend-inner-icon="ri-search-line" clearable />
          </VCol>
          <v-col cols="12" md="3">
            <v-switch v-model="mostrarEliminados" label="Ver eliminados" color="primary" @change="getCharges" inset
              density="compact" />
          </v-col>

          <VCol class="d-flex justify-end" cols="12" sm="3">
            <VBtn color="primary" prepend-icon="ri-add-line" @click="showTarjetaSelectDialog = true">
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

      <VDataTableServer :items-per-page="pagination.itemsPerPage" :page="pagination.page" :headers="headers"
        :loading="loading" loading-text="Cargando..." :items="charges" :items-length="totalProduct"
        class="text-no-wrap rounded-0" @update:options="updateOptions">

        <template v-slot:loading>
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
        <template #item.fecha="{ item }">
          <span :class="{ 'font-weight-black': item.accesed === false || item.accesed === 0 }">
            {{ item.fecha }}
          </span>
        </template>
        <template #item.hora="{ item }">
          <span :class="{ 'font-weight-black': item.accesed === false || item.accesed === 0 }">
            {{ item.hora }}
          </span>
        </template>
        <template #item.lugar="{ item }">
          <span :class="{ 'font-weight-black': item.accesed === false || item.accesed === 0 }">
            {{ item.lugar }}
          </span>
        </template>
        <template #item.tarjeta_combustible="{ item }">
          <span :class="{ 'font-weight-black': item.accesed === false || item.accesed === 0 }">
            {{ item.tarjeta_combustible }}
          </span>
        </template>
        <template #item.cantidad="{ item }">
          <span :class="{ 'font-weight-black': item.accesed === false || item.accesed === 0 }">
            {{ item.fecha }}
          </span>
        </template>
        <template #item.tipo_combustible="{ item }">
          <span :class="{ 'font-weight-black': item.accesed === false || item.accesed === 0 }">
            {{ item.tipo_combustible }}
          </span>
        </template>
        <template #item.odometro="{ item }">
          <span :class="{ 'font-weight-black': item.accesed === false || item.accesed === 0 }">
            {{ item.odometro }}
          </span>
        </template>
        <template #item.no_chip="{ item }">
          <span :class="{ 'font-weight-black': item.accesed === false || item.accesed === 0 }">
            {{ item.no_chip }}
          </span>
        </template>
        <template #item.chofer="{ item }">
          <span :class="{ 'font-weight-black': item.accesed === false || item.accesed === 0 }">
            {{ item.chofer }}
          </span>
        </template>
        <template #item.registrado_por="{ item }">
          <span :class="{ 'font-weight-black': item.accesed === false || item.accesed === 0 }">
            {{ item.registrado_por }}
          </span>
        </template>



        <template #item.actions="{ item }">
          <v-btn variant="text" @click="goToCargasEdit(item.id)" icon="ri-eye-line"></v-btn>
        </template>

      </VDataTableServer>
    </VCard>


  </div>
</template>
