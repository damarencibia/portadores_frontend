  <script setup>
  import { onMounted, ref, watch } from 'vue'
  import { $axios } from '../../utils/api'
  import { fetchFilters, fetchVechicles, updateVehicle } from './index'
  import { debounce } from 'lodash';
  import { onClickOutside } from '@vueuse/core';
  import { useRouter } from 'vue-router';
  import { useImageStore } from '@/@core/stores/images';
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
    { title: "Año ", text: "ano", value: "ano"},
    { title: "tipo combustible", text: "tipo_combustible_id", value: "tipo_combustible_id", align: 'center'},
    { title: "indice consumo", text: "indice_consumo", value: "indice_consumo" },
    { title: "prueba litro", text: "prueba_litro", value: "prueba_litro" },
    { title: "ficav", text: "ficav", value: "ficav", align: 'center' },
    { title: "capacidad tanque", text: "capacidad_tanque", value: "capacidad_tanque", align: 'center' },
    { title: "color", text: "color", value: "color" },
    { title: "numero motor", text: "numero_motor", value: "numero_motor" },
    { title: "empresa", text: "empresa_id", value: "empresa_id", align: 'center' },
    { title: "numero chasis", text: "numero_chasis", value: "numero_chasis" },
    { title: "chofer", text: "chofer_id", value: "chofer_id" },
    { title: "estado tecnico", text: "estado_tecnico", value: "estado_tecnico" },
    { title: 'Actions', key: 'actions', sortable: false, },
  ]);

  // Debounce para la búsqueda en tiempo real (300ms de delay)
  const debouncedSearch = debounce(() => {
    getProducts() // Debe llamarse sin parámetros
  }, 300)

  // Manejar cambios en el input de búsqueda
  const onSearchInput = () => {
    pagination.value.page = 1; // Resetear a la primera página
    debouncedSearch();
  };

  const products = ref([])
  const totalProduct = ref(0)

  // Data table options
  const pagination = ref({ page: 1, itemsPerPage: 20, sortBy: null, orderBy: null });
  const updateOptions = options => {
    pagination.value.sortBy = options.sortBy[0]?.key
    pagination.value.orderBy = options.sortBy[0]?.order
    pagination.value.page = options.page
    pagination.value.itemsPerPage = options.itemsPerPage
    getProducts()
  }

  const handleToggleDestacated = async (product) => {
    if (!product) return; // Validación adicional

    try {
      const newValue = !product.destacated;
      const currentProduct = products.value.find(p => p.id === product.id);

      if (!currentProduct) {
        giveMeASnack({
          message: "Producto no encontrado",
          color: 'error'
        })
      }

      // Cambio optimista
      currentProduct.destacated = newValue;

      const response = await updateVehicle(product.id, {
        destacated: newValue
      });

      if (!response.success) {
        giveMeASnack({
          message: response.message,
          color: 'error'
        })
      }

      // Actualizar con datos del servidor
      Object.assign(currentProduct, response.data);

    } catch (error) {
      // Revertir cambio
      const productToRevert = products.value.find(p => p.id === product.id);
      if (productToRevert) {
        productToRevert.destacated = !newValue;
      }
      giveMeASnack({
        message: error?.message || "Error al actualizar",
        color: 'error'
      })
      console.error(error);
    }
  };

  const handleToggleVisible = async (product) => {
    if (!product) return; // Validación adicional

    try {
      const newValue = !product.visible;
      const currentProduct = products.value.find(p => p.id === product.id);

      if (!currentProduct) {
        giveMeASnack({
          message: "Producto no encontrado",
          color: 'error'
        })
      }

      // Cambio optimista
      currentProduct.visible = newValue;

      const response = await updateVehicle(product.id, {
        visible: newValue
      });

      if (!response.success) {
        giveMeASnack({
          message: response.message,
          color: 'error'
        })
      }

      // Actualizar con datos del servidor
      Object.assign(currentProduct, response.data);

    } catch (error) {
      // Revertir cambio
      const productToRevert = products.value.find(p => p.id === product.id);
      if (productToRevert) {
        productToRevert.visible = !newValue;
      }
      giveMeASnack({
        message: error?.message || "Error al actualizar",
        color: 'error'
      })
      console.error(error);
    }
  };

  const saledForm = ref(null)
  // Confirmar cambio de cantidad vendida
  const confirmSaledChange = async (product) => {
    // 1) Validar Vuetify form
    const isValid = await saledForm.value.validate()
    if (!isValid) {
      giveMeASnack({
        message: 'Por favor, ingresa un valor válido para la cantidad',
        color: 'error'
      })
      return
    }

    try {
      // 2) Pasa el product.id real
      const response = await updateVehicle(product.id, { saled: product.saled_modified })
      // 3) Si funciona, actualiza el array
      if (response?.success) {
        const p = products.value.find(p => p.id === product.id)
        if (p) p.saled = product.saled_modified
      } else {
        giveMeASnack({
          message: response.message,
          color: 'error'
        })
      }
    } catch (e) {
      // 4) Si falla, reviertes
      const p = products.value.find(p => p.id === product.id)
      if (p) p.saled_modified = p.saled
      console.log(e);
      giveMeASnack({
        message: e.message || 'Error al actualizar la cantidad',
        color: 'error'
      })
    }
  }




  // Cancelar cambio de cantidad
  const cancelSaledChange = (product) => {
    const productToCancel = products.value.find(p => p.id === product.id);
    if (productToCancel) {
      // Revertir el valor de saled_modified al valor original de amount
      productToCancel.saled_modified = productToCancel.saled;
    }
  };


  //filters
  const search = ref("");
  const loading = ref(false);
  const categories = ref([]);
  const selectedCategory = ref(null);
  const selectedSubCategory = ref([]);
  const subCategories = ref([]);
  const computedSubcategories = ref([]);
  const selectedDestacated = ref(null);
  const selectedVisible = ref(null);

  //functions
  const getProducts = async () => {
    loading.value = true;
    const response = await fetchVechicles(
      pagination.value.page,
      pagination.value.itemsPerPage,
      pagination.value.sortBy,
      pagination.value.orderBy,
      selectedCategory.value,
      selectedSubCategory.value,
      search.value,
      selectedDestacated.value,
      selectedVisible.value
    )

    if (!response.success) {
      giveMeASnack({
        message: response.message,
        color: 'error'
      })
      return
    }

    products.value = response.data.map((item) => {
      return {
        ...item,
        saled_modified: item.saled,
      }
    });

    totalProduct.value = response.meta.total
    loading.value = false;
  }

  const getFilters = async () => {
    const response = await fetchFilters()

    if (!response.success) {
      giveMeASnack({
        message: response.message,
        color: 'error'
      })
      return
    }

    categories.value = response.data.map((item) => ({
      title: item.name,
      value: item.id
    }));

    subCategories.value = response.data.map(item => ({
      category_id: item.id,
      subcategories: item.subcategories.map(sub => ({
        title: sub.name,
        value: sub.id,
      }))
    }));

    computedSubcategories.value = subCategories.value;

  }

  const handleSubcategoryChange = (value) => {
    selectedSubCategory.value = Array.isArray(value) ? value : [value];
  };

  const router = useRouter();

  // Función específica para navegar a detalles
  const goToProductDetails = (vehicleId) => {
    router.push(`/products/details/${vehicleId}`);
  };

  watch([selectedCategory, selectedSubCategory], () => {
    getProducts();
  });

  watch(search, () => {
    debouncedSearch()
  })

  // Watcher para actualizar subcategorías cuando cambia la categoría
  watch(selectedCategory, () => {
    computedSubcategories.value = [];
    if (selectedCategory.value) {
      const category = subCategories.value.find(
        el => el.category_id === selectedCategory.value
      );
      if (category) {
        computedSubcategories.value = [...category.subcategories];
      }
    } else {
      // Mostrar todas las subcategorías si no hay categoría seleccionada
      computedSubcategories.value = subCategories.value.flatMap(
        cat => cat.subcategories
      );
    }
    selectedSubCategory.value = []; // Resetear subcategorías seleccionadas
  });

  onMounted(() => {
    getProducts()
    getFilters();
    useImageStore().clearImages()
  })

  watch([selectedDestacated, selectedVisible], () => {
    getProducts()
  })


  const rules = {
    required: [
      v => !!v || 'El campo es obligatorio',
    ],
    numeric: [
      v => !v || /^-?\d+(\.\d+)?$/.test(v) || "El campo debe ser un número válido",  // Acepta números decimales
    ],
    string: [
      v => typeof v === 'string' && v.trim().length > 0 || 'El campo debe ser una cadena de texto no vacía',
    ]
  };


</script>

  <template>
    <div>
      <!-- 👉 products -->
      <VCard title="Filters">
        <VCardText>
          <VRow>
            <!-- 👉 Select Category -->
            <VCol cols="12" sm="6">
              <VSelect v-model="selectedCategory" label="Categoría" placeholder="Seleccionar Categoría"
                :items="categories" clearable clear-icon="ri-close-line" />
            </VCol>

            <!-- 👉 Select SubCategory -->
            <VCol cols="12" sm="6">
              <VSelect v-model="selectedSubCategory" label="Subcategoría" placeholder="Seleccionar Subcategoría"
                :items="computedSubcategories" @change="handleSubcategoryChange" chips clearable multiple
                clear-icon="ri-close-line" />
            </VCol>


          </VRow>
          <VRow>
            <!-- 👉 Select Destacado -->
            <VCol cols="12" sm="6" class="d-flex flex-column flex-sm-row justify-center align-center">
              <VLabel class="mr-sm-5 mb-2 mb-sm-0" style="min-inline-size: min-content;">
                Productos Visibles
              </VLabel>
              <VBtnToggle density="compact" v-model="selectedVisible" class="filter-button-group"
                style="min-inline-size: min-content;">
                <VBtn :value="0" prepend-icon="ri-close-circle-line">
                  <template #prepend>
                    <VIcon color="error" />
                  </template>
                </VBtn>
                <VBtn label="Todos" icon="ri-circle-line" />
                <VBtn :value="1" append-icon="ri-checkbox-circle-line">
                  <template #append>
                    <VIcon color="success" />
                  </template>
                </VBtn>
              </VBtnToggle>
            </VCol>
            <!-- 👉 Select Visible -->

            <VCol cols="12" sm="6" class="d-flex flex-column flex-sm-row justify-center align-center">
              <VLabel class="mr-sm-5 mb-2 mb-sm-0" style="min-inline-size: min-content;">
                Productos Destacados
              </VLabel>
              <VBtnToggle density="compact" v-model="selectedDestacated" class="filter-button-group"
                style="min-inline-size: min-content;">
                <VBtn :value="0" prepend-icon="ri-close-circle-line">
                  <template #prepend>
                    <VIcon color="error" />
                  </template>
                </VBtn>
                <VBtn label="Todos" icon="ri-circle-line" />
                <VBtn :value="1" append-icon="ri-checkbox-circle-line">
                  <template #append>
                    <VIcon color="success" />
                  </template>
                </VBtn>
              </VBtnToggle>
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
              <VBtn color="primary" :block="isMobile" prepend-icon="ri-add-line" @click="$router.push('/products/add')">
                Añadir Producto
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>

        <!-- 👉 Datatable  -->
        <VDataTableServer :items-per-page="pagination.itemsPerPage" :page="pagination.page" :headers="headers"
          :loading="loading" loading-text="Cargando..." :items="products" :items-length="totalProduct"
          class="text-no-wrap rounded-0" @update:options="updateOptions">

          <template v-slot:loading>
            <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
          </template>

          <!-- product  -->
          <template #item.name="{ item }">
            <div class="d-flex align-center gap-x-4">
              <VAvatar v-if="item.image_url" size="38" variant="tonal" rounded :image="item.image_url" />
              <div class="d-flex flex-column">
                <span class="text-base text-high-emphasis font-weight-medium">{{ item.name }}</span>
              </div>
            </div>
          </template>

          <!-- saled -->
          <template #item.saled="{ item }">
            <VForm ref="saledForm" @submit.prevent="confirmSaledChange(item)">
              <div class="d-flex align-center gap-2" style="min-width: 50px;">
                <!-- Botón decremento -->
                <VBtn icon="ri-subtract-line" size="x-small" density="compact" color="white"
                  :disabled="item.saled_modified <= 0" @click="item.saled_modified = item.saled_modified - 1">
                </VBtn>

                <!-- Campo de cantidad con contenedor -->
                <div @click.stop>
                  <VTextField v-model="item.saled_modified" density="compact" style="width: 120px;" multiline auto-grow
                    :rows="1" :max-rows="3" :rules="[...rules.required, ...rules.numeric]" ref="saledField" />
                </div>

                <!-- Botón incremento -->
                <VBtn icon="ri-add-line" size="x-small" density="compact" color="white"
                  @click="item.saled_modified = item.saled_modified + 1" :disabled="item.saled_modified >= item.amount">
                </VBtn>

                <!-- Botones de confirmación -->
                <div v-if="item.saled != item.saled_modified" class="d-flex gap-2 ml-4">
                  <VBtn icon="ri-check-line" color="white" type="submit" class="elevation-0" density="compact"
                    size="x-small">
                  </VBtn>
                  <VBtn icon="ri-close-line" color="white" class="elevation-0" density="compact" size="x-small"
                    @click="cancelSaledChange(item)">
                  </VBtn>
                </div>
              </div>
            </VForm>
          </template>



          <template #item.description="{ item }">
            <div class="text-wrap" style="min-width: 500px; max-width: 800px;">
              {{ item.description }}
            </div>
          </template>

          <!-- category -->
          <template #item.category="{ item }">
            <VAvatar size="30" variant="tonal" :color="resolveCategory(item.category)?.color" class="me-4">
              <VIcon :icon="resolveCategory(item.category)?.icon" size="18" />
            </VAvatar>
            <span class="text-base text-high-emphasis">{{ item.category }}</span>
          </template>

          <!-- destacated -->
          <template #item.destacated="{ item }">
            <VSwitch :model-value="item?.destacated ?? false" @update:model-value="handleToggleDestacated(item)"
              color="primary" inset hide-details />
          </template>

          <!-- visible -->
          <template #item.visible="{ item }">
            <VSwitch :model-value="item?.visible ?? false" @update:model-value="handleToggleVisible(item)"
              color="primary" inset hide-details />
          </template>

          <template #item.color="{ item }">

            <VChip class="mx-1" v-for="(color) in item.color" size="x-small">
              {{ color }}
            </VChip>

          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <v-btn variant="text" icon="ri-eye-line" @click="() => goToProductDetails(item.id)"></v-btn>
            <v-btn variant="text" @click="router.push(`/products/edit/${item.id}`)" icon="ri-edit-box-line"></v-btn>
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
