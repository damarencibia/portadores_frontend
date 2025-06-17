<script setup>
import { layoutConfig } from '@layouts'
import { can } from '@layouts/plugins/casl'
import { useLayoutConfigStore } from '@layouts/stores/config'
import {
  getComputedNavLinkToProp,
  getDynamicI18nProps,
  isNavLinkActive,
} from '@layouts/utils';

// Importa las funciones necesarias de Vue
import { ref, onMounted } from 'vue';

// Importa VBadge de Vuetify
import { VBadge } from 'vuetify/components';

// Importa las funciones de API para cargas y retiros
// IMPORTANTE: ¡Ajusta estas rutas a donde se encuentren tus funciones!
import { fetchAccessedChargeIds } from '@/pages/cargas/index';
import { fetchAccessedRetirosIds } from '@/pages/retiros/index';

// Importa getUserProfile desde tu archivo de API general
// IMPORTANTE: Ajusta esta ruta a donde se encuentre tu función getUserProfile.
import { getUserProfile } from '@/utils/api'; // EJEMPLO: '@/api/index' o '@/services/auth'


const props = defineProps({
  item: {
    type: null,
    required: true,
  },
});

const configStore = useLayoutConfigStore();
const hideTitleAndBadge = configStore.isVerticalNavMini();

// Estado reactivo para almacenar el conteo de cargas ACCEDIDAS
const accessedChargesCount = ref(0);
// Estado reactivo para almacenar el conteo de retiros ACCEDIDOS
const accessedRetirosCount = ref(0);

// Nuevo estado reactivo para almacenar si el usuario es supervisor
const currentUserIsSupervisor = ref(false);


// Función para obtener el conteo de cargas accedidas y actualizar la insignia
const updateAccessedChargesBadge = async () => {
  console.log(`💡 [VerticalNavLink - ${props.item.title}] updateAccessedChargesBadge: Función iniciada.`);

  // Solo hacemos la llamada API si este es el elemento "Cargas de combustible"
  // Y si el usuario actual es un supervisor
  if (props.item.title === 'Cargas de combustible' && currentUserIsSupervisor.value) {
    try {
      const response = await fetchAccessedChargeIds();
      console.log(`💡 [VerticalNavLink - ${props.item.title}] Respuesta de la API para Cargas:`, response);

      if (response.success) {
        accessedChargesCount.value = response.data?.count || 0;
        console.log(`✅ [VerticalNavLink - ${props.item.title}] Conteo de cargas ACCEDIDAS actualizado: ${accessedChargesCount.value}`);
      } else {
        console.error(`❌ [VerticalNavLink - ${props.item.title}] Fallo al obtener cargas ACCEDIDAS:`, response.message);
        accessedChargesCount.value = 0;
      }
    } catch (error) {
      console.error(`🔥 [VerticalNavLink - ${props.item.title}] Error en la llamada a fetchAccessedChargeIds:`, error);
      accessedChargesCount.value = 0;
    } finally {
      console.log(`💡 [VerticalNavLink - ${props.item.title}] updateAccessedChargesBadge: Función finalizada.`);
    }
  } else {
    // Si no es el elemento correcto O no es supervisor, asegura que el conteo sea 0
    accessedChargesCount.value = 0;
  }
};

// Función para obtener el conteo de retiros accedidos y actualizar su insignia
const updateAccessedRetirosBadge = async () => {
  console.log(`💡 [VerticalNavLink - ${props.item.title}] updateAccessedRetirosBadge: Función iniciada.`);

  // Solo hacemos la llamada API si este es el elemento "Salidas de combustible"
  // Y si el usuario actual es un supervisor
  if (props.item.title === 'Salidas de combustible' && currentUserIsSupervisor.value) {
    try {
      const response = await fetchAccessedRetirosIds();
      console.log(`💡 [VerticalNavLink - ${props.item.title}] Respuesta de la API para Retiros:`, response);

      if (response.success) {
        accessedRetirosCount.value = response.data?.count || 0;
        console.log(`✅ [VerticalNavLink - ${props.item.title}] Conteo de retiros ACCEDIDOS actualizado: ${accessedRetirosCount.value}`);
      } else {
        console.error(`❌ [VerticalNavLink - ${props.item.title}] Fallo al obtener retiros ACCEDIDOS:`, response.message);
        accessedRetirosCount.value = 0;
      }
    } catch (error) {
      console.error(`🔥 [VerticalNavLink - ${props.item.title}] Error en la llamada a fetchAccessedRetirosIds:`, error);
      accessedRetirosCount.value = 0;
    } finally {
      console.log(`💡 [VerticalNavLink - ${props.item.title}] updateAccessedRetirosBadge: Función finalizada.`);
    }
  } else {
    // Si no es el elemento correcto O no es supervisor, asegura que el conteo sea 0
    accessedRetirosCount.value = 0;
  }
};


// Llama a las funciones cuando el componente se monta
onMounted(async () => {
  console.log(`🚀 [VerticalNavLink - ${props.item.title}] Componente montado, iniciando verificación de rol.`);

  // Primero, obtenemos el perfil del usuario para verificar su rol
  try {
    const userProfile = await getUserProfile();
    // Verificamos si la propiedad 'roles' del perfil es 'supervisor'
    if (userProfile && userProfile.roles === 'supervisor') {
      currentUserIsSupervisor.value = true;
    } else {
      currentUserIsSupervisor.value = false;
    }
    console.log(`🎯 [VerticalNavLink - ${props.item.title}] Usuario es supervisor: ${currentUserIsSupervisor.value}`);
  } catch (error) {
    console.error(`❌ [VerticalNavLink - ${props.item.title}] Error al obtener el perfil del usuario:`, error.message);
    currentUserIsSupervisor.value = false; // Asegura que no se muestren insignias si hay un error
  }

  // Si el usuario es supervisor, actualiza las insignias y configura los intervalos
  if (currentUserIsSupervisor.value) {
    updateAccessedChargesBadge();
    updateAccessedRetirosBadge();

    if (props.item.title === 'Cargas de combustible') {
      setInterval(() => {
        console.log(`🔄 [VerticalNavLink Interval - ${props.item.title}] Actualizando insignia de Cargas...`);
        updateAccessedChargesBadge();
      }, 60000); // Se actualiza cada 60 segundos
    }
    if (props.item.title === 'Salidas de combustible') {
      setInterval(() => {
        console.log(`🔄 [VerticalNavLink Interval - ${props.item.title}] Actualizando insignia de Retiros...`);
        updateAccessedRetirosBadge();
      }, 60000); // Se actualiza cada 60 segundos
    }
  } else {
    console.log(`🚫 [VerticalNavLink - ${props.item.title}] El usuario no es supervisor, los intervalos de actualización no se configurarán.`);
  }
});
</script>

<template>
    <li
    v-if="can(item.action, item.subject) && (!item.meta?.requiresSupervisor || currentUserIsSupervisor)"
    class="nav-link"
    :class="{ disabled: item.disable }"
  >
    <Component
      :is="item.to ? 'RouterLink' : 'a'"
      v-bind="getComputedNavLinkToProp(item)"
      :class="{ 'router-link-active router-link-exact-active': isNavLinkActive(item, $router) }"
      class="nav-link-item-wrapper"
    >
      <Component
        :is="layoutConfig.app.iconRenderer || 'div'"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
        class="nav-item-icon"
      />
      <TransitionGroup name="transition-slide-x">
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-show="!hideTitleAndBadge"
          key="title"
          class="nav-item-title"
          v-bind="getDynamicI18nProps(item.title, 'span')"
        >
          {{ item.title }}
        </Component>

        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-if="item.badgeContent"
          v-show="!hideTitleAndBadge"
          key="original-badge"
          class="nav-item-badge"
          :class="item.badgeClass"
          v-bind="getDynamicI18nProps(item.badgeContent, 'span')"
        >
          {{ item.badgeContent }}
        </Component>

                <VBadge
          v-if="item.title === 'Cargas de combustible' && accessedChargesCount > 0 && currentUserIsSupervisor"
          v-show="!hideTitleAndBadge"
          key="accessed-charges-vbadge"
          :content="accessedChargesCount"
          color="warning"
          variant="tonal"
          inline
          class="nav-item-vbadge ml-2" />

        <VBadge
          v-if="item.title === 'Salidas de combustible' && accessedRetirosCount > 0 && currentUserIsSupervisor"
          v-show="!hideTitleAndBadge"
          key="accessed-retiros-vbadge"
          :content="accessedRetirosCount"
          color="warning"
          variant="tonal"
          inline
          class="nav-item-vbadge ml-2" />

      </TransitionGroup>
    </Component>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-link a {
    display: flex;
    align-items: center;
    .nav-item-title {
      margin-inline-end: auto; // Empuja la insignia a la derecha
    }
  }
}

// Opcional: Estilos adicionales para la VBadge si es necesario
.nav-item-vbadge {
  .v-badge__badge {
    min-width: 1.5em; // Asegura un ancho mínimo para dígitos individuales
    height: 1.5em;    // Mantiene la forma circular/ovalada
    padding: 0 0.5em; // Añade relleno horizontal
  }
}
</style>