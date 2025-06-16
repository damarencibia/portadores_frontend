<template>
  <v-card class="pa-4" width="600">
    <v-card-title class="text-center py-3 text-h5">Registrar Carga de Combustible</v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="6">
          <v-text-field v-model="form.fecha" label="Fecha" type="date" required />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="form.hora" label="Hora" type="time" required />
        </v-col>

        <v-col cols="4">
          <v-text-field v-model="form.cantidad" label="Cantidad (litros)" type="number" required :rules="[
            v => v === null || v === '' ? 'La cantidad es requerida' : true,
            v => parseFloat(v) > 0 || 'Debe ser mayor que 0'
          ]" @keypress="soloNumeros($event)" />
        </v-col>

        <v-col cols="4">
          <v-sheet variant="outlined">
            <div class="text-caption text-grey">Importe CUP</div>
            <div class="text-body-1">{{ importe }}</div>
          </v-sheet>
        </v-col>

        <v-col cols="4">
          <v-sheet variant="outlined">
            <div class="text-caption text-grey">Saldo Actual</div>
            <div class="text-body-1">{{ props.saldoActual }}</div>
          </v-sheet>
        </v-col>

        <v-col cols="12">
          <v-text-field v-model="form.lugar" label="Lugar" required />
        </v-col>
        <!-- <v-col cols="6">
          <v-text-field v-model="formattedNumeroTarjeta" label="Número de Tarjeta" required maxlength="19"
            @input="onInputTarjeta" @keypress="soloNumeros($event)" />
        </v-col> -->
        <v-col cols="6">
          <v-text-field v-model="form.no_chip" label="No. Chip" required />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="form.odometro" label="Odómetro" type="number" required />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="form.motivo" label="Motivo de la carga" />
        </v-col>
      </v-row>
      <!-- Alert sobrepasa saldo -->
      <v-col cols="12" v-if="sobrepasaSaldo">
        <v-alert type="warning" density="compact" border="start" variant="tonal">
          El importe excede el saldo disponible de la tarjeta.
        </v-alert>
      </v-col>
    </v-card-text>
    <v-card-actions class="d-flex justify-end gap-2">
      <v-btn variant="outlined" @click="emit('cancel')">Cancelar</v-btn>
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
  saldoActual: { type: Number, required: true },
  precioCombustible: { type: Number, required: false },
})

const form = ref({
  fecha: '',
  hora: '',
  cantidad: '',
  odometro: '',
  lugar: '',
  // numero_tarjeta: '',
  no_chip: '',
  motivo: '',
})

const precio = ref(0)         // aquí guardamos el precio por litro
const importe = ref(0)        // importe = precio * cantidad

// Función para traer el precio del API
const fetchPrecio = async (id) => {
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
    // !form.value.numero_tarjeta ||
    !form.value.no_chip ||
    !form.value.motivo ||
    parseFloat(importe.value) <= 0 ||
    sobrepasaSaldo.value
  )
})

const sobrepasaSaldo = computed(() => {
  return parseFloat(importe.value) > props.saldoActual
})

const soloNumeros = (e) => {
  const char = String.fromCharCode(e.keyCode || e.which);
  const esNumero = /^[0-9.]$/.test(char);
  if (!esNumero) e.preventDefault();
};

/*funciones visuales:
1234-5678-9012-3456, pero internamente debe mantenerse como:
1234567890123456, sin afectar la BD.
*/
// const formattedNumeroTarjeta = computed({
//   get() {
//     const raw = form.value.numero_tarjeta.replace(/\D/g, ''); // Solo números
//     return raw
//       .substring(0, 16)
//       .replace(/(\d{4})(?=\d)/g, '$1-') // Inserta guión cada 4 dígitos, excepto al final
//       .slice(0, 19); // Máximo 16 números + 3 guiones
//   },
//   set(val) {
//     form.value.numero_tarjeta = val.replace(/\D/g, '').slice(0, 16); // Guarda sin guiones
//   }
// });
const onInputTarjeta = (e) => {
  formattedNumeroTarjeta.value = e.target.value;
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

/* (Opcional) Actualiza el watch por si el tarjetaId cambia dinámicamente 
* (por navegación interna)
*/
watch(() => props.tarjetaId, nuevoId => {
  if (!props.tipoCombustibleId && nuevoId) {
    fetchPrecioDesdeTarjeta(nuevoId)
  }
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
