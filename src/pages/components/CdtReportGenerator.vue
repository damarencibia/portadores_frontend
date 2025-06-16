<script setup>
import { ref, onBeforeUnmount, inject } from 'vue';
import { generateCdtPdfReport } from '@/views/pages/vehiculos/VehiculoForm'; // Ajusta la ruta si es necesario

const giveMeASnack = inject('Snackbar:giveMeASnack');

const isLoading = ref(false);
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const pdfUrl = ref(null);

const months = [
  { value: 1, text: 'Enero' },
  { value: 2, text: 'Febrero' },
  { value: 3, text: 'Marzo' },
  { value: 4, text: 'Abril' },
  { value: 5, text: 'Mayo' },
  { value: 6, text: 'Junio' },
  { value: 7, text: 'Julio' },
  { value: 8, text: 'Agosto' },
  { value: 9, text: 'Septiembre' },
  { value: 10, text: 'Octubre' },
  { value: 11, text: 'Noviembre' },
  { value: 12, text: 'Diciembre' },
];

const generateReport = async () => {
  isLoading.value = true;

  try {
    // Llama al API
    const { success, message, file } = await generateCdtPdfReport(
      selectedYear.value,
      selectedMonth.value,
      null
    );

    if (success) {
      // Libera URL anterior si existe
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
      }
      const blob = new Blob([file], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      pdfUrl.value = url;
      window.open(url, '_blank');
      giveMeASnack({ message, color: 'success' });
    } else {
      giveMeASnack({ message, color: 'error' });
    }
  } catch (error) {
    giveMeASnack({ message: 'Fallo inesperado al generar el reporte CDT', color: 'error' });
    console.error('generateReport error:', error);
  } finally {
    isLoading.value = false;
  }
};

onBeforeUnmount(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
  }
});
</script>

<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title>Generar Reporte de Coeficiente de Disponibilidad Técnica (CDT)</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedMonth"
              :items="months"
              item-title="text"
              item-value="value"
              label="Mes"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="selectedYear"
              label="Año"
              type="number"
              :rules="[
                v => !!v || 'Año requerido',
                v => (v >= 1900 && v <= new Date().getFullYear() + 1) || 'Año inválido'
              ]"
              required
            />
          </v-col>
        </v-row>
        <v-btn
          color="primary"
          @click="generateReport"
          :loading="isLoading"
          class="mt-4"
        >
          Generar Reporte PDF
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Vista previa opcional con iframe -->
    <v-card v-if="pdfUrl" class="mt-8">
      <v-card-title>Vista Previa del Reporte CDT</v-card-title>
      <v-card-text>
        <iframe
          :src="pdfUrl"
          style="width: 100%; height: 600px; border: none;"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
/* estilos específicos aquí */
</style>
