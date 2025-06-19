<script setup>
import { onMounted, ref, watch, inject, computed } from 'vue'
import { fetchCombustibles } from './index'
import { debounce } from 'lodash';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay() // Obtiene las propiedades de pantalla
const giveMeASnack = inject('Snackbar:giveMeASnack')
const isMobile = computed(() => mobile.value)

//data table
const headers = ref([
    { title: "nombre", value: "nombre", value: "nombre" },
    { title: "precio", value: "precio", value: "precio" },
    { title: 'Acciones', key: 'actions', sortable: false, }
]);

// Debounce para la búsqueda en tiempo real (300ms de delay)
const debouncedSearch = debounce(() => {
    getCombustibles() // Debe llamarse sin parámetros
}, 300)

// Manejar cambios en el input de búsqueda
const onSearchInput = () => {
    pagination.value.page = 1; // Resetear a la primera página
    debouncedSearch();
};

const combustibles = ref([])
const totalProduct = ref(0)

// Data table options
const pagination = ref({ page: 1, itemsPerPage: 20, sortBy: null, orderBy: null });
const updateOptions = options => {
    pagination.value.sortBy = options.sortBy[0]?.key
    pagination.value.orderBy = options.sortBy[0]?.order
    pagination.value.page = options.page
    pagination.value.itemsPerPage = options.itemsPerPage
    getCombustibles()
}

//filters
const search = ref("");
const loading = ref(false);


//functiones load
const getCombustibles = async () => {
    loading.value = true;
    const response = await fetchCombustibles(
        pagination.value.page,
        pagination.value.itemsPerPage,
        search.value
    );

    if (!response.success) {
        giveMeASnack({ message: response.message, color: 'error' });
        return;
    }

    combustibles.value = response.data.map((item) => {
        return { ...item };
    });

    totalProduct.value = response.meta.total;
    loading.value = false;
}


const router = useRouter();

// Función específica para navegar a detalles
const goToUserDetails = (combustibleId) => {
    router.push(`/combustibles/details/${combustibleId}`);
};
const goToUserEdit = (combustibleId) => {
    router.push(`/combustibles/edit/${combustibleId}`);
};

// observadores
// watch([selectedChofer, selectedTipoCombustible, selectedActiva], () => {
//     getCombustibles();
// });

watch(search, () => {
    debouncedSearch()
})

onMounted(() => {
    getCombustibles()
})

</script>

<template>
    <div>
        <VCard title="combustibles">
            <VCardText class="d-flex justify-space-between gap-4">
                <VRow class="w-100">
                    <VCol cols="12" sm="6">
                        <VTextField v-model="search" @input="onSearchInput" placeholder="Buscar chofer"
                            density="compact" prepend-inner-icon="ri-search-line" clearable />
                    </VCol>
                    <VCol class="d-flex w-100 justify-end" cols="12" sm="6">
                        <VBtn color="primary" :block="isMobile" prepend-icon="ri-add-line"
                            @click="$router.push('/combustibles/add')" class="mr-2">
                            Añadir Tipo Combustible
                        </VBtn>

                    </VCol>
                </VRow>
            </VCardText>

            <VDataTableServer :items-per-page="pagination.itemsPerPage" :page="pagination.page" :headers="headers"
                :loading="loading" loading-text="Cargando..." :items="combustibles" :items-length="totalProduct"
                class="text-no-wrap rounded-0" @update:options="updateOptions">

                <template v-slot:loading>
                    <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                </template>

                <template #item.actions="{ item }">
                    <v-btn variant="text" icon="ri-eye-line" @click="goToUserDetails(item.id)"></v-btn>
                    <v-btn variant="text" @click="goToUserEdit(item.id)" icon="ri-edit-box-line"></v-btn>
                </template>

            </VDataTableServer>
        </VCard>

        <PdfExportDialog v-model="showExportDialog" :tarjetas="combustibles" @pdf-generated="handlePdfGenerated"
            @pdf-error="handlePdfError" />
    </div>
</template>

<style>
.cl {
    color: #d7b36b
}
</style>