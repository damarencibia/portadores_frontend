<script setup>
import { ref, watch, computed, onMounted, inject } from 'vue';
import ConfirmDeleteDialog from '@/pages/components/ConfirmDeleteDialog.vue';
import {
  fetchNextProductCode,
  submitProduct,
  fetchChoferes,
  fetchSubcategories,
  fetchVechicleById,
  updateProduct,
  deleteProduct
} from './ProductForm';
import { PRODUCT_ACTIONS } from '@/constants/products';
import { useRouter } from 'vue-router';
const router = useRouter();
import { useImageStore } from '@/@core/stores/images'
const imageStore = useImageStore()
import AddSubcategory from '@/pages/components/AddSubcategory.vue';
import AddCategory from '@/pages/components/AddCategory.vue';
// Definición de props del componente
const props = defineProps({
  productId: {
    type: Number,
    required: false
  },
  action: {
    type: String,
    required: true,
    validator: value => Object.values(PRODUCT_ACTIONS).includes(value)
  }
});

const giveMeASnack = inject('Snackbar:giveMeASnack')

// Definición de emits del componente
const validForm = ref(true);
const form = ref(null);

// Opciones para selects
const states = ref(['Disponible', 'Agotado']);
const categories = ref([]);
const tipos_vechiculos = ['auto', 'camión', 'camioneta', 'moto'];
const subcategories = ref([]);

// Estado del formulario con valores iniciales
const tipoPeso = ref(null);
const formData = ref({
  numero_interno: null,
  name: null,
  description: null,
  price: null,
  amount: null,
  saled: 0,
  state: states.value[0], // 'disponible'
  dimension: null,
  weight: null,
  capacity: null,
  color: [],
  tipo_vehiculo: null,
  subcategory_id: null
});

// Estados de la UI
const isLoading = ref(false);
const errorMessage = ref(null);
const visible = ref(true);
const destacated = ref(false);

const showConfirmDelete = ref(false)
const toogleShowConfirmDelete = () => {
  showConfirmDelete.value = !showConfirmDelete.value
}


// Función separada para cargar categorías
const loadChoferes = async () => {
  try {
    const catResponse = await fetchChoferes();
    if (catResponse.success) {
      categories.value = catResponse.data;
    } else {
      giveMeASnack({
        message: catResponse.message || "Error al cargar categorías",
        color: 'error'
      })
    }
  } catch (error) {
    giveMeASnack({
      message: "Error al cargar categorías",
      color: 'error'
    })
    console.error(error);
  }
};

/**
* Carga los datos de un producto existente para edición/visualización
*/
const loadProductById = async () => {
  try {
    isLoading.value = true;

    const productResponse = await fetchVechicleById(props.productId);
    if (productResponse.success) {
      // Asignar todos los datos del producto al formulario
      formData.value = {
        ...productResponse.data,
        color: productResponse.data.color || [''],
      };

      // // Asignar estados de los checkboxes
      // visible.value = Boolean(productResponse.data.visible);
      // destacated.value = Boolean(productResponse.data.destacated);
    } else {
      giveMeASnack({
        message: productResponse.message || "Error al cargar el producto",
        color: 'error'
      })
    }
  } catch (error) {
    giveMeASnack({
      message: "Error inesperado al cargar el producto",
      color: 'error'
    })
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// Cargar datos cuando el componente se monta
onMounted(async () => {
  try {
    // 1. Cargar categorías (siempre necesario)
    await loadChoferes();

    // 3. Si hay productId, cargar el producto
    if (props.productId) {
      await loadProductById();
    }
  } catch (error) {
    giveMeASnack({
      message: "Error al inicializar el formulario",
      color: 'error'
    })
    console.error("Error en carga inicial:", error);
  }
});

// Título dinámico según la acción (crear/editar/ver)
const title = computed(() => {
  switch (props.action) {
    case PRODUCT_ACTIONS.EDIT: return 'Editar producto';
    case PRODUCT_ACTIONS.SHOW: return 'Detalles del producto';
    default: return 'Añadir Producto';
  }
});

const btnTitle = computed(() => {
  switch (props.action) {
    case PRODUCT_ACTIONS.EDIT: return 'Actualizar';
    case PRODUCT_ACTIONS.SHOW: return 'Editar';
    default: return 'Guardar';
  }
});

const handleMainButtonClick = async () => {
  if (btnTitle.value === 'Editar') {
    // Navegar a la página de edición
    router.push(`/products/edit/${props.productId}`);
  } else if (btnTitle.value !== 'Editar') {

    if (!(await form.value.validate()).valid) {
      giveMeASnack({
        message: "Hay campos del formulario que no son válidos",
        color: 'error'
      })
      return false
    }
    const response = await handleSubmit();
    console.log(response);

    if (response?.success) {
      imageStore.clearImages()
      router.push(`/products/details/${response.data.product_id}`);
    }
  }
};

// Determina si el formulario es editable
const canWrite = computed(() =>
  [PRODUCT_ACTIONS.CREATE, PRODUCT_ACTIONS.EDIT].includes(props.action)
);

/**
* Maneja la eliminación de campos de color
* @param {number} index - Índice del color a eliminar
*/
const removeColor = (index) => {
  formData.value.color.splice(index, 1);
};

/**
* Resetea el formulario a sus valores iniciales
*/
const resetForm = async () => {
  formData.value = {
    code: null,
    name: '',
    description: '',
    price: 0,
    amount: 0,
    saled: 0,
    state: 'disponible',
    dimension: '',
    weight: 0,
    capacity: '',
    color: [''],
    tipo_vehiculo: null,
    subcategory_id: null
  };
  visible.value = false;
  destacated.value = false;
};

/**
* Maneja el envío del formulario (creación o actualización)
*/
const handleSubmit = async () => {
  isLoading.value = true;

  try {
    // Preparar datos para enviar
    const payload = {
      ...formData.value,
      price: parseFloat(formData.value.price),
      amount: parseInt(formData.value.amount),
      weight: formData.value.weight ? formData.value.weight + " " + tipoPeso.value : null,
      visible: visible.value,
      destacated: destacated.value,
      images: imageStore.images.map(img => ({
        url: img.url,
        path: img.path,
        name: img.file?.name,
        size: img.file?.size
      }))
    };

    let response = null;
    if (props.productId) {
      // Actualización de producto existente
      response = await updateProduct(props.productId, payload);
      if (response.success) {
        giveMeASnack({
          message: response.message || 'Producto actualizado exitosamente',
          color: 'success'
        })
        // Recargar datos actualizados
        await loadProductById();
        isLoading.value = false;
        return response
      }
    } else {
      // Creación de nuevo producto
      response = await submitProduct(payload);

      if (response.success) {
        giveMeASnack({
          message: response.message || 'Producto creado exitosamente',
          color: 'success'
        })
        resetForm();
        isLoading.value = false;
        return response
      }
    }

    if (!response.success) {
      giveMeASnack({
        message: response.message || "Error al procesar el producto",
        color: 'error'
      })
    }
  } catch (error) {
    giveMeASnack({
      message: errorMessage.value = error.message || "Error inesperado al enviar el formulario",
      color: 'error'
    })
    console.error(error);
  } finally {
    isLoading.value = false;
  }
  return false
};

const addColorDialog = ref(false)
const newColor = ref(null)
const toggleAddColorDialog = () => {
  addColorDialog.value = !addColorDialog.value;
};
const addNewColor = () => {
  if (newColor.value) {
    formData.value.color.push(newColor.value);
    newColor.value = '';
    toggleAddColorDialog();
  }
}
// Eliminar producto
const handleDeleteProduct = async () => {
  isLoading.value = true
  try {
    toogleShowConfirmDelete()
    const response = await deleteProduct(props.productId)
    if (response.success) {
      giveMeASnack({
        message: "Producto eliminado correctamente",
        color: 'success'
      })
      router.push('/products')
    } else {
      giveMeASnack({
        message: errorMessage.value = response.message || 'Error al eliminar producto',
        color: 'error'
      })
    }
  } catch (error) {
    giveMeASnack({
      message: errorMessage.value = 'Error inesperado al eliminar producto',
      color: 'error'
    })
    console.error("Error completo:", error)
  }
  isLoading.value = false
}

const rules = {
  required: [
    v => v !== null && v !== undefined && v !== '' || 'El campo es obligatorio',
  ],
  numeric: [
    v => v == null || v === '' || /^-?\d+(\.\d+)?$/.test(v) || "El campo debe ser un número válido",
  ],
  string: [
    v => typeof v === 'string' && v.trim().length > 0 || 'El campo debe ser una cadena de texto no vacía',
  ],
  notMoreThanAmount: [
    v => v <= formData.value.amount || 'La cantidad vendida no puede ser mayor a la cantidad total'
  ]

};

const dialogSubcategory = ref(false)
const showCategoryDialog = ref(false)
const toggleCategoryDialog = (success = null) => {
  showCategoryDialog.value = !showCategoryDialog.value
  success ? loadChoferes() : null
}

const toggleSubcategoryDialog = async (success = null) => {
  dialogSubcategory.value = !dialogSubcategory.value
  if (success) {
    subcategories.value = (await fetchSubcategories(formData.value.tipo_vehiculo)).data
  }
}
</script>


<template>
  <div>
    <v-form @submit.prevent="handleMainButtonClick" ref="form">
      <v-row class="mb-6">
        <v-col cols="12" md="8">
          <h4 class="text-h4 text-md-h3"> {{ title }} </h4>
        </v-col>

        <v-col cols="12" md="4" class="d-flex gap-2 justify-start justify-md-end ">
          <VBtn v-if="props.action != 'SHOW'" variant="outlined" @click="router.go(-1)" color="secondary">Cancelar
          </VBtn>
          <VBtn v-else variant="outlined" prepend-icon="ri-arrow-left-line" @click="router.push('/products')"
            color="secondary">Atrás
          </VBtn>
          <v-btn v-if="props.action == 'SHOW'" color="error" prepend-icon="ri-delete-bin-line"
            @click="toogleShowConfirmDelete" :loading="isLoading">Eliminar</v-btn>
          <VBtn @click="handleMainButtonClick" :type="props.action != 'EDIT' ? 'submit' : 'button'"
            prepend-icon="ri-edit-box-line" :loading="isLoading" :disabled="isLoading">
            {{ btnTitle }}
          </VBtn>
        </v-col>
      </v-row>

      <VRow>
        <VCol cols="12" md="8">
          <!-- 👉 Información del Producto -->
          <VCard class="mb-6" title="Información del Producto">
            <VCardText>
              <VRow>
                <VCol cols="12" md="4">
                  <VTextField v-model="formData.numero_interno" label="Código Interno" />
                </VCol>

                <VCol cols="12" md="4">
                  <VTextField v-model="formData.marca" label="Marca" placeholder="Marca"/>
                </VCol>

                <VCol cols="12" md="4">
                  <VTextField v-model="formData.modelo" label="Modelo"/>
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField v-model="formData.amount" label="Cantidad Total*" :readonly="!canWrite" :rules="[
                    ...rules.required, ...rules.numeric,
                    v => v >= 0 || 'La cantidad no puede ser negativa'
                  ]" />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField v-model="formData.saled" label="Cantidad Vendida" :disabled="!formData.amount"
                    :readonly="!canWrite" :rules="[
                      ...rules.numeric, ...rules.notMoreThanAmount
                    ]" />
                </VCol>

                <VCol cols="12" md="6">
                  <VSelect v-model="formData.state" label="Estado*" :readonly="!canWrite" :items="states"
                    :rules="[v => !!v || 'Estado es requerido']" />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField v-model="formData.dimension" label="Dimensiones" placeholder="Ej: 16cm x 5cm"
                    :readonly="!canWrite" />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField v-model="formData.weight" label="Peso y Unidad de Medida" :readonly="!canWrite" />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField v-model="formData.capacity" label="Capacidad" placeholder="Ej: 128 GB"
                    :readonly="!canWrite" />
                </VCol>

                <VCol cols="12" class="d-flex w-100 align-center justify-space-between gap-3">
                  <v-combobox class="pa-0 ma-0 w-100" v-model="formData.color" :items="formData.color" label="Colores"
                    variant="outlined" chips :clearable="canWrite" :closable-chips="canWrite" multiple readonly
                    :menu-icon="null" hide-no-data append-inner-icon="" hide-details>
                    <template #chip="{ props, item }">
                      <v-chip v-bind="props">
                        <strong>{{ item.raw }}</strong>
                      </v-chip>
                    </template>
                  </v-combobox>

                  <v-btn icon="ri-add-line" color="primary" @click="toggleAddColorDialog" v-if="canWrite">
                  </v-btn>


                  <!-- Diálogo para añadir nuevo color -->
                  <v-dialog v-model="addColorDialog" max-width="400">
                    <v-card>
                      <v-card-title>Añadir nuevo color</v-card-title>
                      <v-card-text>
                        <v-text-field v-model="newColor" label="Nombre" />
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn text @click="toggleAddColorDialog">Cancelar</v-btn>
                        <v-btn color="primary" @click="addNewColor">Añadir</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>


        </VCol>

        <VCol cols="12" md="4">
          <!-- 👉 Organización -->
          <VCard title="Organización" class="mb-6">
            <VCardText>
              <div class="d-flex flex-column gap-y-4">
                <div class="d-flex justify-between align-center gap-3">
                  <VAutocomplete v-model="formData.category_id" label="Chofer" :items="categories"
                    item-title="title" item-value="value" :rules="[...rules.required]" :readonly="!canWrite" clearable
                    :disabled="isLoading" />
                  <v-btn v-if="props.action != 'SHOW'" color="primary" @click="toggleCategoryDialog"
                    icon="ri-add-line"></v-btn>
                </div>
                <div class="d-flex justify-between align-center gap-3">
                  <VAutocomplete v-model="formData.tipo_vehiculo" label="Tipo vehículo" :items="tipos_vechiculos"
                    item-title="title" item-value="value" :rules="[...rules.required]" :readonly="!canWrite" clearable
                    :disabled="isLoading" />
                  <v-btn v-if="props.action != 'SHOW'" color="primary" @click="toggleCategoryDialog"
                    icon="ri-add-line"></v-btn>
                </div>
              </div>
            </VCardText>
            <v-dialog v-model="showCategoryDialog" max-width="400">
              <add-category @close="(success) => toggleCategoryDialog(success)"></add-category>
            </v-dialog>
            <v-dialog v-model="dialogSubcategory" max-width="400">
              <add-subcategory :categoryId="formData.category_id"
                @close="(success) => toggleSubcategoryDialog(success)"></add-subcategory>
            </v-dialog>
          </VCard>

          <VCard class="mb-6">
            <VCardText>
              <VSwitch :readonly="!canWrite" v-model="visible" label="Marcar como visible" />
              <VSwitch :readonly="!canWrite" v-model="destacated" label="Marcar como destacado" />
            </VCardText>
          </VCard>
        </VCol>
        <v-col cols="12" md="8">

        </v-col>
      </VRow>
    </v-form>
    <v-dialog v-model="showConfirmDelete" max-width="500">
      <confirm-delete-dialog @cancel="toogleShowConfirmDelete()" @confirm="handleDeleteProduct"></confirm-delete-dialog>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.drop-zone {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 6px;
}

.inventory-card {

  .v-radio-group,
  .v-checkbox {
    .v-selection-control {
      align-items: start !important;
    }
  }
}
</style>

<style lang="scss">
.ProseMirror {
  p {
    margin-block-end: 0;
  }

  padding: 0.5rem;
  outline: none;

  p.is-editor-empty:first-child::before {
    block-size: 0;
    color: #adb5bd;
    content: attr(data-placeholder);
    float: inline-start;
    pointer-events: none;
  }
}
</style>
