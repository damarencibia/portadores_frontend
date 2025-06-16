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

// Importa VBadge de Vuetify (asegúrate de que esta ruta sea correcta para tu configuración)
import { VBadge } from 'vuetify/components';

// Importa la función de API proporcionada por ti para obtener cargas accedidas
// IMPORTANTE: ¡Ajusta esta ruta a donde se encuentra tu `fetchAccessedChargeIds`!
import { fetchAccessedChargeIds } from '@/pages/cargas/index';


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

// Función para obtener el conteo de cargas accedidas y actualizar la insignia
const updateAccessedChargesBadge = async () => {
  // Log 1: Inicio de la ejecución de la función
  console.log(`💡 [VerticalNavLink - ${props.item.title}] updateAccessedChargesBadge: Función iniciada.`);

  // Solo hacemos la llamada API si este es el elemento "Cargas de combustible"
  if (props.item.title === 'Cargas de combustible') { // ¡Asegúrate de que este título coincida exactamente con el de tu navItems!
    try {
      const response = await fetchAccessedChargeIds();
      // Log 2: Respuesta de la API recibida
      console.log(`💡 [VerticalNavLink - ${props.item.title}] Respuesta de la API recibida:`, response);

      if (response.success) {
        // Usamos response.data.count porque tu función fetchAccessedChargeIds devuelve el conteo dentro del objeto 'data'
        accessedChargesCount.value = response.data?.count || 0;
        // Log 3: Éxito y conteo actualizado
        console.log(`✅ [VerticalNavLink - ${props.item.title}] Conteo de cargas ACCEDIDAS actualizado: ${accessedChargesCount.value}`);
      } else {
        console.error(`❌ [VerticalNavLink - ${props.item.title}] Fallo al obtener cargas ACCEDIDAS:`, response.message);
        accessedChargesCount.value = 0;
      }
    } catch (error) {
      // Log 4: Error durante la llamada API
      console.error(`🔥 [VerticalNavLink - ${props.item.title}] Error en la llamada a fetchAccessedChargeIds:`, error);
      accessedChargesCount.value = 0;
    } finally {
      // Log 5: Fin de la ejecución de la función
      console.log(`💡 [VerticalNavLink - ${props.item.title}] updateAccessedChargesBadge: Función finalizada.`);
    }
  } else {
    // Log si no es el elemento objetivo
    console.log(`💡 [VerticalNavLink - ${props.item.title}] No es el elemento 'Cargas de combustible', omitiendo la actualización de la insignia.`);
  }
};

// Llama a la función cuando el componente se monta
onMounted(() => {
  // Log 6: Ejecución del hook onMounted
  console.log(`🚀 [VerticalNavLink - ${props.item.title}] Componente montado, iniciando actualización de la insignia si aplica.`);
  updateAccessedChargesBadge();

  // Opcional: Configura un intervalo para actualizaciones periódicas.
  // Es mejor tener un solo intervalo a nivel superior para eficiencia,
  // pero aquí lo incluimos si lo prefieres en este componente.
  if (props.item.title === 'Cargas de combustible') {
    setInterval(() => {
      console.log(`🔄 [VerticalNavLink Interval - ${props.item.title}] Iniciando actualización periódica de la insignia...`);
      updateAccessedChargesBadge();
    }, 60000); // Se actualiza cada 5 minutos (300 segundos)
  }
});
</script>

<template>
  <li
    v-if="can(item.action, item.subject)"
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
          v-if="item.title === 'Cargas de combustible' && accessedChargesCount > 0"
          v-show="!hideTitleAndBadge"
          key="accessed-charges-vbadge"
          :content="accessedChargesCount"
          color="info"  variant="tonal"
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