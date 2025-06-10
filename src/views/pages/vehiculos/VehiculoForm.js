export const fetchVehiculoById = async id => {
    try {
      const { data } = await $axios.get(`/vehiculos/${id}`);
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
  
export const submitVehiculo = async payload => {
    try {
      const { data } = await $axios.post('/vehiculos', payload);
      return { success: data.success, data: data.data };
    } catch ({ response }) {
      return { success: false, message: response.data.message, data: response.data.errors };
    }
};
  
export const updateVehiculo = async (id, payload) => {
    try {
      const { data } = await $axios.put(`/vehiculos/${id}`, payload);
      return { success: data.success, data: data.data };
    } catch ({ response }) {
      return { success: false, message: response.data.message, data: response.data.errors };
    }
};
  
export const deleteVehiculo = async id => {
    try {
      const { data } = await $axios.delete(`/vehiculos/${id}`);
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

export const fetchEmpresas = async () => {
  try {
    // const { data } = await $axios.get('/empresas'); // Ajusta el endpoint
    // return { success: true, data: data.data };
    return { success: true, data: [{ id: 1, nombre: 'Empresa X' }, { id: 2, nombre: 'Empresa Y' }] };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

export const fetchEstadosTecnicos = async () => {
  try {
    // const { data } = await $axios.get('/estados-tecnicos'); // Ajusta el endpoint
    // return { success: true, data: data.data };
    return { success: true, data: [{ id: 'BUENO', nombre: 'Bueno' }, { id: 'REGULAR', nombre: 'Regular' }] };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};
