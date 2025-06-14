export const fetchCargaById = async id => {
  try {
    const { data } = await $axios.get(`/carga-combustibles/${id}`);
    console.log(data.data);
    
    return { success: data.success, data: data.data };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

export const fetchTiposCombustibleNames = async () => {
try {
  const { data } = await $axios.get('/tipo-combustibles/get-names');
  // console.log(data.data);
  
  return { success: true, data: data.data };
} catch {
  return { success: false, message: 'Error cargando tipos de combustible' };
}
};

export const submitTarjeta = async payload => {
  try {
    const { data } = await $axios.post('/tarjetas-combustible', payload);
    return { success: data.success, data: data.data };
  } catch ({ response }) {
    return { success: false, message: response.data.message, data: response.data.errors };
  }
};

export const updateTarjeta = async (id, payload) => {
  try {
    const { data } = await $axios.put(`/tarjetas-combustible/${id}`, payload);
    return { success: data.success, data: data.data };
  } catch ({ response }) {
    return { success: false, message: response.data.message, data: response.data.errors };
  }
};

export const destroyCharge = async (id, deletion_reason) => {
  let message = null;
  let success = null;
  let data = null;
  let meta = null;

  try {
      const request = await $axios.delete(`/carga-combustibles/${id}`, {
          data: {
              deletion_reason
          }
      });

      success = request?.data?.success;
      message = request?.data?.message;
      data = request?.data?.data;
      meta = request?.data?.meta;

      return { success, message, data, meta };
  } catch (error) {
      message = error?.response?.data?.message || error || "Ocurrió un error al eliminar la carga de combustible.";

      success = false;
      return { success, message, data, meta };
  }
};

export const fetchTiposCombustible = async () => {
try {
  // const { data } = await $axios.get('/tipos-combustible'); // Ajusta el endpoint
  // return { success: true, data: data.data };
  // Datos de ejemplo mientras desarrollas el backend:
  return { success: true, data: [{ id: 1, nombre: 'Gasolina Regular' }, { id: 2, nombre: 'Diesel' }] };
} catch (e) {
  return { success: false, message: e.response?.data?.message || e.message };
}
};

export const validarCarga = async (id, { valid, validadoPorId, motivoRechazo = null }) => {
  try {
    // Construimos el payload base. 'validado_por_id' ahora es requerido por el backend
    // para registrar quién realiza la acción, ya sea de validación o rechazo.
    const payload = {
      valid,
      validado_por_id: validadoPorId,
    };

    // Si la acción es un rechazo (valid: false), añadimos el motivo.
    // El backend lo validará como obligatorio en este caso.
    if (!valid) {
      payload.motivo_rechazo = motivoRechazo;
    }

    const { data } = await $axios.post(`/carga-combustibles/${id}/validar`, payload);
    
    // Devolvemos los datos de la carga, que ahora el backend retorna tanto en validación como en rechazo.
    return { success: data.success, message: data.message, data: data.data };

  } catch ({ response }) {
    // Mejoramos el manejo de errores para incluir los errores de validación
    return {
      success: false,
      message: response?.data?.message || 'Error al procesar la carga',
      errors: response?.data?.errors || null, // Muy útil para mostrar errores específicos
    };
  }
};


