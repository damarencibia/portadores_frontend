<template>
  <v-card class="pa-6" width="700" rounded="2xl" elevation="3">
    <v-card-title class="text-center text-h5 font-weight-bold text-primary">
      Registrar Retiro de Combustible
    </v-card-title>

    <v-divider class="my-4"></v-divider>

    <v-card-text>
      <v-row dense>
        <!-- Fecha y Hora -->
        <v-col cols="6">
          <v-text-field v-model="form.fecha" label="Fecha" type="date" required />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="form.hora" label="Hora" type="time" required />
        </v-col>

        <!-- Cantidad -->
        <v-col cols="4">
          <v-text-field v-model="form.cantidad" label="Cantidad (litros)" type="number" required :rules="[
            v => v === null || v === '' ? 'La cantidad es requerida' : true,
            v => parseFloat(v) > 0 || 'Debe ser mayor que 0'
          ]" @keypress="soloNumeros($event)" prepend-inner-icon="ri-oil-line" />
        </v-col>

        <!-- Importe Informativo -->
        <v-col cols="4">
          <div class="d-felx justify-end text-caption text-grey mb-1">Importe (CUP)</div>
          <div class="d-flex align-center gap-2">
            <span class="text-body-1 font-weight-medium">{{ importe }}</span>
            <v-tooltip location="top">
              <template #activator="{ props }">
                <v-icon v-bind="props" icon="ri-information-line" color="info" size="18" />
              </template>
              <span>
                El cálculo del importe es informativo<br>
                ya que el retiro fue pagado durante la carga.
              </span>
            </v-tooltip>
          </div>
        </v-col>

        <!-- Cantidad Actual -->
        <v-col cols="4">
          <div class="text-caption text-grey mb-1">Cantidad Disponible</div>
          <div class="text-body-1 font-weight-medium">
            {{ props.cantidadActual }} L
          </div>
        </v-col>

        <!-- Lugar -->
        <v-col cols="12">
          <v-text-field v-model="form.lugar" label="Lugar" prepend-inner-icon="ri-map-pin-line" required />
        </v-col>

        <!--Chip -->
        <v-col cols="6">
          <v-text-field v-model="form.no_chip" label="No. Chip" required prepend-inner-icon="ri-cpu-line" />
        </v-col>

        <!-- Odómetro -->
        <v-col cols="6">
          <v-text-field v-model="form.odometro" label="Odómetro" type="number" required
            prepend-inner-icon="ri-dashboard-line" />
        </v-col>

        <!-- Motivo -->
        <v-col cols="12">
          <v-textarea v-model="form.motivo" label="Motivo del Retiro" rows="2" auto-grow
            prepend-inner-icon="ri-edit-line" />
        </v-col>
      </v-row>

      <!-- Alerta si sobrepasa -->
      <v-col cols="12" v-if="sobrepasaCantidad">
        <v-alert type="warning" density="comfortable" variant="tonal" border="start" class="mt-4">
          La cantidad ingresada excede la cantidad disponible.
        </v-alert>
      </v-col>
    </v-card-text>

    <!-- Acciones -->
    <v-card-actions class="justify-end mt-4 gap-2">
      <v-btn variant="outlined" color="secondary" @click="emit('cancel')">Cancelar</v-btn>
      <v-btn color="primary" @click="submit" :disabled="formInvalido">
        Guardar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>


<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  tarjetaId: { type: Number, required: true },
  registradoPorId: { type: Number, required: true },
  tipoCombustibleId: { type: Number, required: false },
  cantidadActual: { type: Number, required: false },
})

const form = ref({
  fecha: '',
  hora: '',
  cantidad: '',
  odometro: '',
  lugar: '',
  no_chip: '',
  motivo: '',
})

const precio = ref(0)         // aquí guardamos el precio por litro
const importe = ref(0)        // importe = precio * cantidad

// Función para traer el precio del API
const fetchPrecio = async (id) => {
  console.log("fecth precio activado");

  try {
    const res = await $axios.get(`/tipo-combustibles/${id}`)
    // res.data puede ser { success, data: { precio, ... } }
    // o ser directamente el objeto del tipo si el controlador usa show()
    const payload = res.data.data ?? res.data
    precio.value = payload.precio ?? 0

  } catch (e) {
    console.error('Error al obtener precio:', e)
    precio.value = 0
  }
}

const fetchPrecioDesdeTarjeta = async (tarjetaId) => {
  try {
    const res = await $axios.get(`/tarjetas-combustible/${tarjetaId}/precio`)
    const payload = res.data.data ?? res.data
    precio.value = payload.precio ?? 0
  } catch (e) {
    console.error('Error al obtener precio desde tarjeta:', e)
    precio.value = 0
  }
}

const formInvalido = computed(() => {
  return (
    !form.value.fecha ||
    !form.value.hora ||
    !form.value.cantidad ||
    !form.value.odometro ||
    !form.value.lugar ||
    !form.value.no_chip ||
    !form.value.motivo ||
    parseFloat(importe.value) <= 0 ||
    sobrepasaCantidad.value
  )
})

const sobrepasaCantidad = computed(() => {
  return parseFloat(form.value.cantidad) > props.cantidadActual
})

const soloNumeros = (e) => {
  const char = String.fromCharCode(e.keyCode || e.which);
  const esNumero = /^[0-9.]$/.test(char);
  if (!esNumero) e.preventDefault();
};

// 3) Montaje inicial: si ya hay un tipo, tráete el precio
onMounted(() => {
  if (props.tipoCombustibleId) {
    fetchPrecio(props.tipoCombustibleId)
  } else if (props.tarjetaId) {
    fetchPrecioDesdeTarjeta(props.tarjetaId)
  }
})

// 4) Cuando cambie el tipo, actualiza precio
watch(() => props.tipoCombustibleId, nuevoId => {
  if (nuevoId) fetchPrecio(nuevoId)
})

// 5) Watch a la cantidad para recalcular el importe
watch(() => form.value.cantidad, litros => {
  const l = parseFloat(litros) || 0
  importe.value = (precio.value * l).toFixed(2)
})

const emit = defineEmits(['cancel', 'confirm'])

const submit = () => {
  let hora = form.value.hora ?? ''
  if (hora.length >= 5) {
    hora = hora.substring(0, 5) // recorta a H:M
  }

  const payload = {
    ...form.value,
    hora, // ya limpio
    registrado_por_id: props.registradoPorId,
    tarjeta_combustible_id: props.tarjetaId,
    cantidad: form.value.cantidad,
    importe: parseFloat(importe.value),
    estado: 'pendiente'
  }

  emit('confirm', payload)
}
</script>