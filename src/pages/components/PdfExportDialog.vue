<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue';
import { exportConsumoCombustiblePDF } from '@/pages/tarjetas/index'; // Ajusta esta ruta si es necesario

// Define las propiedades que este componente espera recibir del padre
const props = defineProps({
    modelValue: { // Para controlar la visibilidad del diálogo con v-model
        type: Boolean,
        required: true,
    },
    tarjetas: { // Opcional: para pasar la lista de tarjetas para el filtro
        type: Array,
        default: () => [],
    },
});

// Define los eventos que este componente emitirá al padre
const emit = defineEmits(['update:modelValue', 'pdf-generated', 'pdf-error']);

// --- Variables para el diálogo de exportación de PDF ---
const exportLoading = ref(false); // Para mostrar un spinner mientras se genera el PDF
const reportYear = ref(new Date().getFullYear()); // Año por defecto: año actual
const reportMonth = ref(new Date().getMonth() + 1); // Mes por defecto: mes actual (Date.getMonth() es 0-11)
const reportTarjetaId = ref(null); // ID de la tarjeta si se quiere filtrar el reporte

// Opciones de meses para el select (¡AQUÍ ESTÁ LA CORRECCIÓN!)
const months = ref([
    { id: 1, name: 'Enero' }, { id: 2, name: 'Febrero' }, { id: 3, name: 'Marzo' },
    { id: 4, name: 'Abril' }, { id: 5, name: 'Mayo' }, { id: 6, name: 'Junio' },
    { id: 7, name: 'Julio' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Septiembre' },
    { id: 10, name: 'Octubre' }, { id: 11, name: 'Noviembre' }, { id: 12, name: 'Diciembre' },
]);

// Años para el select (ej. 5 años atrás y 5 años adelante del actual)
const years = computed(() => {
    const currentYear = new Date().getFullYear();
    const yearsArray = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        yearsArray.push(i);
    }
    return yearsArray;
});

// Getter/Setter para controlar la visibilidad del diálogo a través de v-model
const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

// Función para cerrar el diálogo y resetear valores
const closeDialog = () => {
    dialogVisible.value = false;
    reportYear.value = new Date().getFullYear();
    reportMonth.value = new Date().getMonth() + 1;
    reportTarjetaId.value = null; // Reinicia el filtro de tarjeta
};

// --- Función para exportar a PDF ---
const exportToPDF = async () => {
    exportLoading.value = true;
    try {
        const response = await exportConsumoCombustiblePDF(
            reportYear.value,
            reportMonth.value,
            reportTarjetaId.value // Pasa el ID de la tarjeta si se seleccionó
        );

        if (response.success && response.file) {
            // Crear un URL blob para el archivo
            const url = window.URL.createObjectURL(new Blob([response.file], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            // El nombre del archivo puede venir del backend via Content-Disposition header,
            // o lo puedes generar aquí. Aquí lo generamos.
            link.setAttribute('download', `reporte_consumo_${reportYear.value}_${reportMonth.value}_${reportTarjetaId.value || 'todas'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Liberar el objeto URL
            emit('pdf-generated', 'Reporte PDF generado con éxito!'); // Emitir evento al padre
        } else {
            emit('pdf-error', response.message); // Emitir evento de error al padre
        }

    } catch (error) {
        console.error('Error al exportar a PDF desde componente:', error);
        emit('pdf-error', 'Error inesperado al generar el PDF.'); // Emitir evento de error genérico
    } finally {
        exportLoading.value = false;
        closeDialog(); // Cerrar el diálogo después de la operación
    }
};
</script>

<template>
    <VDialog v-model="dialogVisible" max-width="500px">
        <VCard>
            <VCardTitle class="headline">Exportar Reporte de Consumo</VCardTitle>
            <VCardText>
                <VRow>
                    <VCol cols="12">
                        <VSelect v-model="reportYear" :items="years" label="Año del Reporte" required />
                    </VCol>
                    <VCol cols="12">
                        <VSelect v-model="reportMonth" :items="months" item-title="name" item-value="id"
                            label="Mes del Reporte" required />
                    </VCol>
                    <VCol cols="12">
                        <VAutocomplete v-model="reportTarjetaId" :items="props.tarjetas" item-title="numero"
                            item-value="id" label="Filtrar por Tarjeta (Opcional)" clearable />
                    </VCol>
                </VRow>
            </VCardText>
            <VCardActions>
                <VSpacer></VSpacer>
                <VBtn color="secondary" text @click="closeDialog">Cancelar</VBtn>
                <VBtn color="primary" :loading="exportLoading" @click="exportToPDF">Generar PDF</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>