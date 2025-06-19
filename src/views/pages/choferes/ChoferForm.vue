<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import ConfirmDeleteDialog from '@/pages/components/ConfirmDeleteDialog.vue';
import {
    fetchChoferById,
    submitChofer,
    updateChofer,
    deleteChofer,
    fetchChoferDetails // Ensure this is correctly imported from your service file
} from './ChoferForm'; // Adjust this path if your service file is elsewhere

import { useRouter } from 'vue-router';

// Initialize Vue Router and Snackbar for notifications
const router = useRouter();
const giveMeASnack = inject('Snackbar:giveMeASnack');

// Define component props for dynamic behavior
const props = defineProps({
    choferId: { type: Number, required: false }, // ID of the chofer for edit/show
    action: { type: String, required: true } // 'CREATE', 'EDIT', 'SHOW'
});

// Form reference for validation
const form = ref(null);

// Reactive state for basic chofer form data
const formData = ref({
    nombre: '',
    apellidos: '',
    email: '',
    // 'password' is only used for 'CREATE' and generated dynamically
});

// Reactive state to hold all detailed chofer data (for 'SHOW' action)
const choferDetails = ref(null);

// Loading state and delete confirmation dialog control
const isLoading = ref(false);
const showConfirmDelete = ref(false);
const toogleShowConfirmDelete = () => (showConfirmDelete.value = !showConfirmDelete.value);

// Password generation for new chofer creation
const generatedPassword = ref('');

const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
};

// --- Chofer Data Loading Functions based on Action ---

// Fetches full chofer details including relations for 'SHOW' view
const loadChoferForShow = async () => {
    if (!props.choferId) {
        console.warn('Chofer ID missing for SHOW action.');
        return;
    }
    isLoading.value = true;
    try {
        const res = await fetchChoferDetails(props.choferId);
        if (res.success) {
            choferDetails.value = res.data; // Assign the full detailed object
            Object.assign(formData.value, res.data); // Also populate basic fields for consistency
        } else {
            giveMeASnack({ message: res.message || 'Error al cargar detalles del chofer.', color: 'error' });
            // Consider redirecting if a specific chofer is not found
            if (res.message === 'Chofer no encontrado.') {
                router.push('/choferes'); // Redirect to list if not found
            }
        }
    } catch (error) {
        console.error('Error in loadChoferForShow:', error);
        giveMeASnack({ message: 'Error inesperado al cargar el chofer.', color: 'error' });
    } finally {
        isLoading.value = false;
    }
};

// Fetches basic chofer data for 'EDIT' view
const loadChoferForEdit = async () => {
    if (!props.choferId) {
        console.warn('Chofer ID missing for EDIT action.');
        return;
    }
    isLoading.value = true;
    try {
        const res = await fetchChoferById(props.choferId);
        if (res.success) {
            Object.assign(formData.value, res.data);
            // Remove password from formData if it was accidentally fetched (shouldn't be in fetchById)
            if (formData.value.password) {
                delete formData.value.password;
            }
        } else {
            giveMeASnack({ message: res.message || 'Error al cargar el chofer para edición.', color: 'error' });
            // Consider redirecting if a specific chofer is not found
            if (res.message === 'Chofer no encontrado.') {
                router.push('/choferes'); // Redirect to list if not found
            }
        }
    } catch (error) {
        console.error('Error in loadChoferForEdit:', error);
        giveMeASnack({ message: 'Error inesperado al cargar el chofer para edición.', color: 'error' });
    } finally {
        isLoading.value = false;
    }
};

// --- Utility Functions ---

const goToUserDetails = () => {
    router.push(`/choferes/details/${props.choferId}`);
};

const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword.value)
        .then(() => giveMeASnack({ message: '¡Contraseña copiada al portapapeles!', color: 'success' }))
        .catch(() => giveMeASnack({ message: 'Error al copiar', color: 'error' }));
};

// ===========================================
// Lógica para Edición de Empresa (kept as is for context, assuming external functions)
// ===========================================
const showCompanyEditDialog = ref(false);
const companyData = ref({
    id: null,
    nombre: '',
    direccion: '',
});
const editedCompany = ref({ ...companyData.value });
const companyLoading = ref(false);

const openCompanyEditDialog = async () => {
    companyLoading.value = true;
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || !storedUser.id) {
            giveMeASnack({ message: 'No se pudo obtener el ID del usuario autenticado.', color: 'error' });
            return;
        }
        const userId = storedUser.id;
        // Placeholder for fetchCompanyByUserId - replace with your actual function call
        // This function is not defined in the provided scope.
        const response = await Promise.resolve({ id: 1, nombre: 'Mi Empresa Mock', direccion: 'Calle Ficticia 123' });
        companyData.value = { ...response };
        editedCompany.value = { ...response };
        showCompanyEditDialog.value = true;
    } catch (error) {
        giveMeASnack({ message: error.message || 'Error al cargar datos de la empresa.', color: 'error' });
    } finally {
        companyLoading.value = false;
    }
};

const saveCompanyChanges = async () => {
    companyLoading.value = true;
    try {
        if (!editedCompany.value.id) {
            giveMeASnack({ message: 'ID de empresa no encontrado para actualizar.', color: 'error' });
            return;
        }
        // Placeholder for updateCompany - replace with your actual function call
        // This function is not defined in the provided scope.
        const updated = await Promise.resolve(editedCompany.value);

        companyData.value = { ...updated };
        giveMeASnack({ message: 'Empresa actualizada exitosamente.', color: 'success' });
        showCompanyEditDialog.value = false;
    } catch (error) {
        giveMeASnack({ message: error.message || 'Error al guardar cambios de la empresa.', color: 'error' });
    } finally {
        companyLoading.value = false;
    }
};

const closeCompanyEditDialog = () => {
    showCompanyEditDialog.value = false;
    editedCompany.value = { ...companyData.value };
};
// ===========================================
// End of Company Editing Logic
// ===========================================

// --- Lifecycle Hook ---
onMounted(async () => {
    if (props.action === 'CREATE') {
        const newPassword = generateRandomPassword();
        formData.value.password = newPassword; // Attach password to formData for submission
        generatedPassword.value = newPassword; // Store for display/copy
    } else if (props.action === 'EDIT') {
        await loadChoferForEdit();
    } else if (props.action === 'SHOW') {
        await loadChoferForShow();
    }
});

// --- Computed Properties for UI Text/Behavior ---
const title = computed(() => {
    if (props.action === 'EDIT') return 'Editar Chofer';
    if (props.action === 'SHOW') return 'Detalles del Chofer';
    return 'Añadir Nuevo Chofer';
});

const btnTitle = computed(() => {
    if (props.action === 'EDIT') return 'Actualizar';
    if (props.action === 'SHOW') return 'Editar';
    return 'Guardar';
});

const canWrite = computed(() => ['CREATE', 'EDIT'].includes(props.action));

// --- Main Form Submission / Action Handler ---
const handleMainButtonClick = async () => {
    if (btnTitle.value === 'Editar') {
        // If in 'SHOW' mode and button says 'Editar', navigate to edit page
        router.push(`/choferes/edit/${props.choferId}`);
        return;
    }

    // For 'CREATE' or 'EDIT' actions, validate the form
    if (!(await form.value.validate()).valid) {
        return giveMeASnack({ message: 'Formulario inválido. Revise los campos requeridos.', color: 'error' });
    }

    isLoading.value = true;
    const payload = { ...formData.value }; // Use current form data for payload

    let res;
    if (props.choferId) {
        // If choferId exists, it's an update operation
        res = await updateChofer(props.choferId, payload);
    } else {
        // Otherwise, it's a creation operation
        res = await submitChofer(payload);
    }
    isLoading.value = false;

    if (res.success) {
        giveMeASnack({ message: res.message || 'Chofer guardado con éxito.', color: 'success' });
        // After save/update, redirect to the details page of the new/updated chofer
        router.push(`/choferes/details/${res.data.id}`);
    } else {
        giveMeASnack({ message: res.message || 'Error al guardar el chofer.', color: 'error' });
    }
};

// --- Delete Handler ---
const handleDelete = async () => {
    isLoading.value = true;
    try {
        const res = await deleteChofer(props.choferId);
        if (res.success) {
            giveMeASnack({ message: res.message || 'Chofer eliminado con éxito.', color: 'success' });
            router.push('/choferes'); // Redirect to chofer list after deletion
        } else {
            giveMeASnack({ message: res.message || 'Error al eliminar el chofer.', color: 'error' });
        }
    } catch (error) {
        console.error('Error deleting chofer:', error);
        giveMeASnack({ message: 'Error inesperado al eliminar el chofer.', color: 'error' });
    } finally {
        isLoading.value = false;
        showConfirmDelete.value = false; // Close dialog
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
                    <VBtn variant="outlined" prepend-icon="ri-arrow-left-line" @click="router.push('/choferes')"
                        color="secondary">Atrás
                    </VBtn>
                    <v-btn v-if="props.action !== 'SHOW'" type="submit" :loading="isLoading">
                        {{ btnTitle }}
                    </v-btn>
                    <v-btn v-else type="submit" :loading="isLoading">
                        {{ btnTitle }}
                    </v-btn>
                    <v-btn v-if="props.action !== 'CREATE' && props.action !== 'SHOW'" variant="outlined"
                        @click="goToUserDetails()" :disabled="isLoading">
                        Cancelar
                    </v-btn>
                    <v-btn v-if="props.action === 'SHOW'" color="error" variant="outlined"
                        @click="toogleShowConfirmDelete" prepend-icon="ri-delete-bin-line" :disabled="isLoading">
                        Eliminar
                    </v-btn>
                    <v-dialog width="80vh" v-model="showConfirmDelete">
                        <confirm-delete-dialog @cancel="toogleShowConfirmDelete" @confirm="handleDelete" />
                    </v-dialog>
                </div>
            </v-col>
        </v-row>

        <v-row justify="center" class="mt-5">
            <v-card class="mb-5" width="100vh" title="Información del Chofer">
                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.nombre" label="Nombre" :readonly="!canWrite"
                                :loading="isLoading" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.apellidos" label="Apellidos" :readonly="!canWrite"
                                :loading="isLoading" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.email" label="Email" :readonly="!canWrite"
                                :loading="isLoading" />
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <v-card v-if="props.action === 'SHOW' && choferDetails?.vehiculo" class="mb-5" width="100vh"
                title="Información del Vehículo">
                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field label="Tipo" v-model="choferDetails.vehiculo.tipo_vehiculo" readonly
                                :loading="isLoading" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="Marca" v-model="choferDetails.vehiculo.marca" readonly
                                :loading="isLoading" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="Modelo" v-model="choferDetails.vehiculo.modelo" readonly
                                :loading="isLoading" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="Chapa" v-model="choferDetails.vehiculo.chapa" readonly
                                :loading="isLoading" />
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <v-card v-if="props.action === 'SHOW' && choferDetails?.tarjetas_combustible?.length > 0" class="mb-5"
                width="100vh" title="Tarjetas de Combustible">
                <v-card-text>
                    <v-expansion-panels flat>
                        <v-expansion-panel v-for="(card, index) in choferDetails.tarjetas_combustible" :key="card.id">
                            <v-expansion-panel-title>
                                Tarjeta {{ index + 1 }}: ({{ card.numero }})
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-text-field label="Número" v-model="card.numero" readonly
                                            :loading="isLoading" />
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field label="Fecha de Vencimiento" v-model="card.fecha_vencimiento"
                                            readonly :loading="isLoading" />
                                    </v-col>
                                    <v-col cols="12" md="6" v-if="card.tipo_combustible">
                                        <v-text-field label="Tipo de Combustible" v-model="card.tipo_combustible.nombre"
                                            readonly :loading="isLoading" />
                                    </v-col>
                                </v-row>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-card-text>
            </v-card>

            <v-card
                v-if="props.action === 'SHOW' && !choferDetails?.vehiculo && !choferDetails?.tarjetas_combustible?.length"
                class="mb-5" width="100vh">
                <v-card-text class="text-center text-medium-emphasis">
                    Este chofer no tiene vehículo ni tarjetas de combustible asociadas.
                </v-card-text>
            </v-card>
        </v-row>
    </v-form>

    <VDialog v-model="showCompanyEditDialog" max-width="600px">
        <VCard>
            <VCardTitle class="headline">
                Editar Información de la Empresa
            </VCardTitle>
            <VCardText>
                <VForm @submit.prevent="saveCompanyChanges">
                    <VTextField v-model="editedCompany.nombre" label="Nombre de la Empresa" :disabled="companyLoading"
                        class="mb-4"></VTextField>
                    <VTextField v-model="editedCompany.direccion" label="Dirección de la Empresa"
                        :disabled="companyLoading" class="mb-4"></VTextField>
                    <VCardActions class="px-0">
                        <VSpacer></VSpacer>
                        <VBtn color="secondary" variant="outlined" @click="closeCompanyEditDialog"
                            :disabled="companyLoading">
                            Cancelar
                        </VBtn>
                        <VBtn color="primary" type="submit" :loading="companyLoading">
                            Guardar Cambios
                        </VBtn>
                    </VCardActions>
                </VForm>
            </VCardText>
        </VCard>
    </VDialog>
</template>

<style>
.cl {
    color: #d7b36b
}
</style>