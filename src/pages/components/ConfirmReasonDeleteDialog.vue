<template>
    <v-card class="pa-4" width="500">
        <v-card-title class="text-center py-3 text-h5">Eliminar carga de combustible</v-card-title>
        <v-card-text>
            Está seguro que desea eliminar este registro? Esta acción será <strong>irreversible</strong>.
            <v-textarea class="mt-5" v-model="localReason" label="Motivo de la eliminación" rows="3" auto-grow clearable
                :rules="[v => !!v || 'El motivo es obligatorio.']" />
        </v-card-text>
        <v-card-actions class="d-flex justify-end gap-2">
            <v-btn variant="outlined" @click="onCancel">Cancelar</v-btn>
            <v-btn :disabled="!localReason.trim() || loading" color="error" variant="elevated" @click="onConfirm">
                <span v-if="!loading">Eliminar</span>
                <v-progress-circular v-else indeterminate size="20" width="2" color="white" />
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'cancel', 'confirm'])

const localReason = ref('')

// Cuando abres el diálogo, resetea la razón
watch(() => props.modelValue, val => {
    if (val) localReason.value = ''
})

function onCancel() {
    emit('cancel')
    emit('update:modelValue', false)
}

function onConfirm() {
    emit('confirm', localReason.value.trim())
    // No cerramos hasta que padre confirme
}
</script>