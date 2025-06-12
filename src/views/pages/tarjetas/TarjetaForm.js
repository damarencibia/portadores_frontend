export const fetchTarjetaById = async id => {
    try {
      const { data } = await $axios.get(`/tarjetas-combustible/${id}`);
      console.log(data.data);
      
      return { success: data.success, data: data.data };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || e.message };
    }
};

export const fetchChoferNames = async () => {
    try {
      const { data } = await $axios.get('/choferes/get-names');
      // console.log(data.data);
      
      return { success: true, data: data.data };
    } catch {
      return { success: false, message: 'Error cargando choferes' };
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
  
export const fetchTipoVehiculos = async () => {
    // Retorna lista fija o de API
    return ['auto', 'camión', 'camioneta', 'moto'];
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
  
export const deleteTarjeta = async id => {
    try {
      const { data } = await $axios.delete(`/tarjetas-combustible/${id}`);
      return { success: data.success, message: data.message };
    } catch ({ response }) {
      return { success: false, message: response.data.message };
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

// Gestion de cargas de combustible
export const submitCargaCombustible = async (payload) => {
  try {
    const { data } = await $axios.post('/carga-combustibles', payload);
    return { success: data.success, data: data.data };
  } catch ({ response }) {
    return { success: false, message: response?.data?.message || 'Error al registrar la carga' };
  }
};
export const submitRetiroCombustible = async (payload) => {
  try {
    const { data } = await $axios.post('/retiros-combustible', payload);
    return { success: data.success, data: data.data };
  } catch ({ response }) {
    return { success: false, message: response?.data?.message || 'Error al registrar la carga' };
  }
};

