<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { register, isAuthenticated } from '@/utils/api'; // Ensure register is imported
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'; // If you use this
import { VNodeRenderer } from '@layouts/components/VNodeRenderer';
import { themeConfig } from '@themeConfig';
import { useAuthStore } from '@/@core/stores/auth'; // If you use an auth store

const { global } = useTheme();
const router = useRouter();
const authStore = useAuthStore(); // If you use an auth store

// Define page meta for routing (e.g., if you're using unplugin-vue-router)
definePage({
  meta: {
    layout: 'blank', // Use a blank layout for auth pages
    unauthenticatedOnly: true, // Only accessible if not authenticated
  },
});

const form = ref({
  name: '',
  lastname: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  company_name: '',
  company_address: '',
});

const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const handleRegister = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';

    // Basic client-side validation
    if (!form.value.name || !form.value.lastname || !form.value.email || !form.value.phone ||
        !form.value.password || !form.value.password_confirmation ||
        !form.value.company_name || !form.value.company_address) {
      throw new Error('Por favor, completa todos los campos.');
    }

    if (form.value.password !== form.value.password_confirmation) {
      throw new Error('Las contraseñas no coinciden.');
    }

    // Call the register API function
    const { token, user } = await register({
      name: form.value.name,
      lastname: form.value.lastname,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
      company_name: form.value.company_name,
      company_address: form.value.company_address,
    });

    // Update auth store if you have one
    authStore.user = {
      ...user,
      initials: user.name && user.lastname
        ? `${user.name.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase()
        : 'US',
    };

    // Redirect to a dashboard or success page
    router.push('/usuarios'); // Or '/login' if you want them to log in after registering
  } catch (error) {
    errorMessage.value = error.message;
    console.error('Registration error:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // If already authenticated, redirect away from the registration page
  if (isAuthenticated()) {
    router.replace('/'); // Redirect to home or dashboard if logged in
  }
});
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-4 pt-7" max-width="500">
      <VCardItem class="justify-center">
        <VCardTitle class="text-2xl font-weight-bold">
          <VNodeRenderer :nodes="themeConfig.app.logo" />
          <h4 class="text-h4 mb-1 text-center">
            ¡Registra tu cuenta! 👋🏻
          </h4>
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <VAlert v-if="errorMessage" type="error" class="mb-4">
          {{ errorMessage }}
        </VAlert>

        <VForm @submit.prevent="handleRegister">
          <VRow>
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.name"
                label="Nombre"
                placeholder="Juan"
                :rules="[v => !!v || 'El nombre es requerido']"
                required
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.lastname"
                label="Apellido"
                placeholder="Pérez"
                :rules="[v => !!v || 'El apellido es requerido']"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                label="Email"
                placeholder="juan.perez@example.com"
                type="email"
                :rules="[v => !!v || 'El email es requerido', v => /.+@.+\..+/.test(v) || 'Email no válido']"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="form.phone"
                label="Teléfono"
                placeholder="+1234567890"
                :rules="[v => !!v || 'El teléfono es requerido']"
                required
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="form.company_name"
                label="Nombre de la Empresa"
                placeholder="Mi Empresa S.A."
                :rules="[v => !!v || 'El nombre de la empresa es requerido']"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="form.company_address"
                label="Dirección de la Empresa"
                placeholder="Calle Falsa 123"
                :rules="[v => !!v || 'La dirección de la empresa es requerida']"
                required
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="Contraseña"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                :rules="[v => !!v || 'La contraseña es requerida', v => v.length >= 8 || 'Mínimo 8 caracteres']"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="form.password_confirmation"
                label="Confirmar Contraseña"
                placeholder="············"
                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isConfirmPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                :rules="[v => !!v || 'La confirmación de contraseña es requerida', v => v === form.password || 'Las contraseñas no coinciden']"
                required
              />
            </VCol>

            <VCol cols="12">
              <VBtn class="mt-4" block type="submit" :loading="loading">
                Registrarse
              </VBtn>
            </VCol>

            <VCol cols="12" class="d-flex align-center justify-center flex-wrap">
              <span class="d-flex align-center me-2">
                ¿Ya tienes una cuenta?
              </span>
              <RouterLink
                class="text-primary"
                to="/login"
              >
                Inicia sesión aquí
              </RouterLink>
            </VCol>

            <VCol cols="12" class="text-center">
              <AuthProvider />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss" scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f4f4f4; // Fondo suave
}

.auth-card {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;

  // Scroll agradable
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
}

// Para pantallas muy pequeñas
@media (max-width: 480px) {
  .auth-card {
    padding: 1rem !important;
  }
}
</style>
