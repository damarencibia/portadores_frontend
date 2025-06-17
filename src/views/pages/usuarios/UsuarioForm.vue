<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import ConfirmDeleteDialog from '@/pages/components/ConfirmDeleteDialog.vue';
import {
    fetchUsuarioById,
    submitUsuaio,
    updateUsuario,
    deleteUsuario,
    fetchCompanyByUserId,
    updateCompany
} from './UsuarioForm'; // Assuming UsuarioForm.js contains user API calls

import { useRouter } from 'vue-router';

const router = useRouter();
const giveMeASnack = inject('Snackbar:giveMeASnack');

const props = defineProps({
    usuarioId: { type: Number, required: false },
    action: { type: String, required: true }
});

const form = ref(null);
const formData = ref({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    // Add default empresa_id if your user model can have it directly
    // empresa_id: null,
});

const isLoading = ref(false); // For user operations
const showConfirmDelete = ref(false);
const toogleShowConfirmDelete = () => (showConfirmDelete.value = !showConfirmDelete.value);

const generatedPassword = ref('');

const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
};

const loadUsuario = async () => {
    if (!props.usuarioId) return;
    isLoading.value = true;
    const res = await fetchUsuarioById(props.usuarioId);
    if (res.success) {
        Object.assign(formData.value, res.data);
        if (formData.value.password) {
            delete formData.value.password;
        }
    } else {
        giveMeASnack({ message: res.message, color: 'error' });
    }
    isLoading.value = false;
};

const goToUserDetails = () => {
    router.push(`/usuarios/details/${props.usuarioId}`);
};

const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword.value)
        .then(() => giveMeASnack({ message: '¡Contraseña copiada al portapapeles!', color: 'success' }))
        .catch(() => giveMeASnack({ message: 'Error al copiar', color: 'error' }));
};

// ===========================================
// Lógica para Edición de Empresa
// ===========================================
const showCompanyEditDialog = ref(false);
const companyData = ref({
    id: null,
    nombre: '',
    direccion: '',
});
const editedCompany = ref({ ...companyData.value }); // For the editing form
const companyLoading = ref(false); // For company operations

const openCompanyEditDialog = async () => {
    companyLoading.value = true;
    try {
        // Get the authenticated user's ID from localStorage
        // IMPORTANT: Ensure your login process saves user info to localStorage.
        const storedUser = JSON.parse(localStorage.getItem('user')); // Assuming 'user' is stored here
        if (!storedUser || !storedUser.id) {
            giveMeASnack({ message: 'No se pudo obtener el ID del usuario autenticado.', color: 'error' });
            companyLoading.value = false;
            return;
        }

        const userId = storedUser.id;
        const response = await fetchCompanyByUserId(userId);
        companyData.value = { ...response }; // Store original company data
        editedCompany.value = { ...response }; // Copy for editing in the form

        showCompanyEditDialog.value = true;
    } catch (error) {
        giveMeASnack({ message: error.message, color: 'error' });
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
        const updated = await updateCompany(editedCompany.value.id, {
            nombre: editedCompany.value.nombre,
            direccion: editedCompany.value.direccion,
        });

        companyData.value = { ...updated }; // Update original data with backend response
        giveMeASnack({ message: 'Empresa actualizada exitosamente.', color: 'success' });
        showCompanyEditDialog.value = false; // Close dialog on success
    } catch (error) {
        giveMeASnack({ message: error.message, color: 'error' });
    } finally {
        companyLoading.value = false;
    }
};

const closeCompanyEditDialog = () => {
    showCompanyEditDialog.value = false;
    // Optional: Reset the form to original data or empty state if canceled
    editedCompany.value = { ...companyData.value };
};
// ===========================================
// End of Company Editing Logic
// ===========================================

onMounted(async () => {
    if (props.action === 'CREATE') {
        const newPassword = generateRandomPassword();
        formData.value.password = newPassword;
        generatedPassword.value = newPassword;
    }
    loadUsuario();
});

const title = computed(() => {
    if (props.action === 'EDIT') return 'Editar Usuario';
    if (props.action === 'SHOW') return 'Detalles Usuario';
    return 'Añadir Usuario Operador';
});
const btnTitle = computed(() => {
    if (props.action === 'EDIT') return 'Actualizar';
    if (props.action === 'SHOW') return 'Editar';
    return 'Guardar';
});
const canWrite = computed(() => ['CREATE', 'EDIT'].includes(props.action));

const handleMainButtonClick = async () => {
    if (btnTitle.value === 'Editar') {
        router.push(`/usuarios/edit/${props.usuarioId}`);
        return;
    }
    if (!(await form.value.validate()).valid)
        return giveMeASnack({ message: 'Formulario inválido', color: 'error' });

    isLoading.value = true;
    const payload = { ...formData.value };

    const res = props.usuarioId
        ? await updateUsuario(props.usuarioId, payload)
        : await submitUsuaio(payload);
    isLoading.value = false;

    if (res.success) {
        giveMeASnack({ message: res.message || 'Usuario guardado con éxito.', color: 'success' });
        router.push(`/usuarios/details/${res.data.id}`);
    } else {
        giveMeASnack({ message: res.message, color: 'error' });
    }
};

const handleDelete = async () => {
    isLoading.value = true;
    const res = await deleteUsuario(props.usuarioId);
    isLoading.value = false;
    if (res.success) {
        giveMeASnack({ message: res.message || 'Usuario eliminado con éxito.', color: 'success' });
        router.push('/usuarios');
    } else {
        giveMeASnack({ message: res.message, color: 'error' });
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
                    <VBtn variant="outlined" prepend-icon="ri-arrow-left-line" @click="router.push('/usuarios')"
                        color="secondary">Atrás
                    </VBtn>
                    <v-btn v-if="props.action !== 'SHOW'" type="submit">
                        {{ btnTitle }}
                    </v-btn>
                    <v-btn v-else type="submit">{{ btnTitle }}</v-btn>
                    <v-btn v-if="props.action !== 'CREATE' && props.action !== 'SHOW'" variant="outlined"
                        @click="goToUserDetails()">
                        Cancelar
                    </v-btn>
                    <v-dialog width="80vh" v-model="showConfirmDelete">
                        <confirm-delete-dialog @cancel="toogleShowConfirmDelete" @confirm="handleDelete" />
                    </v-dialog>
                </div>
            </v-col>
        </v-row>

        <v-row justify="center" class="mt-5">
            <v-card class="mb-5" width="100vh" title="Información">
                <template #append v-if="formData.roles === 'supervisor'" >
                    <VBtn color="warning" variant="outlined" prepend-icon="ri-building-line" @click="openCompanyEditDialog">
                        Editar Empresa
                    </VBtn>
                </template>

                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.name" label="Nombre" :readonly="!canWrite" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.lastname" label="Apellidos" :readonly="!canWrite" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.email" label="Email" :readonly="!canWrite" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.phone" label="Celular" :readonly="!canWrite" />
                        </v-col>

                        <v-col cols="12" md="6" v-if="props.action === 'CREATE'">
                            <v-text-field v-model="generatedPassword" label="Contraseña generada" readonly
                                append-inner-icon="ri-clipboard-line" @click:append-inner="copyToClipboard"
                                hint="Haz clic en el icono para copiar" persistent-hint />
                        </v-col>
                    </v-row>

                    <v-alert v-if="props.action === 'CREATE' && generatedPassword" type="info" variant="tonal"
                        class="mt-4">
                        <strong>Importante:</strong> Entrega esta contraseña (<code>{{ generatedPassword }}</code>) al
                        usuario correspondiente para la primera autenticación en el sistema. Luego, el usuario podrá
                        editarla.
                    </v-alert>
                </v-card-text>
                <div class="d-flex justify-center mt-5 mb-5">
                    <v-btn v-if="props.action === 'EDIT'" icon="ri-delete-bin-line" color="error" variant="outlined"
                        @click="toogleShowConfirmDelete"></v-btn>
                </div>
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