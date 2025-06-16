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

/************************************************************************************************** */
export const submitVehiculoInoperatividad = async payload => {
  try {
    const { data } = await $axios.post('/vehiculo-inoperatividades', payload);
    return { success: data.success, data: data.data };
  } catch ({ response }) {
    // Es buena práctica registrar o manejar los errores de validación específicos del backend
    return { success: false, message: response.data.message || 'Error al registrar inoperatividad', data: response.data.errors };
  }
};

export const updateVehiculoInoperatividad = async (id, payload) => {
  try {
    const { data } = await $axios.put(`/vehiculo-inoperatividades/${id}`, payload);
    return { success: data.success, data: data.data };
  } catch ({ response }) {
    return { success: false, message: response.data.message || 'Error al actualizar inoperatividad', data: response.data.errors };
  }
};

export const fetchVehiculoInoperatividades = async (vehiculoId, params = {}) => {
  try {
    const { data } = await $axios.get('/vehiculo-inoperatividades', { params: { ...params, vehiculo_id: vehiculoId } });
    return { success: data.success, data: data.data, meta: data.meta };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message };
  }
};

export const deleteVehiculoInoperatividad = async (id) => {
  try {
    const { data } = await $axios.delete(`/vehiculo-inoperatividades/${id}`);
    return { success: data.success, message: data.message };
  } catch ({ response }) {
    return { success: false, message: response.data.message || 'Error al eliminar la inoperatividad', data: response.data.errors };
  }
};


export const fetchCdtReport = async (year, month, vehiculoId = null) => {
  try {
    const params = { year, month };
    if (vehiculoId) {
      params.vehiculo_id = vehiculoId;
    }
    const response = await $axios.get('/vehiculos/reportes/cdt', {
      params,
      responseType: 'blob' // Important: Set responseType to 'blob' to handle PDF
    });

    // Create a blob URL and a link to download the PDF
    const fileURL = window.URL.createObjectURL(new Blob([response.data]));
    const fileLink = document.createElement('a');

    fileLink.href = fileURL;
    fileLink.setAttribute('download', response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '')); // Extract filename from headers
    document.body.appendChild(fileLink);
    fileLink.click();
    fileLink.remove(); // Clean up the DOM

    return { success: true, message: 'Reporte CDT generado exitosamente.' };
  } catch (e) {
    // Handle specific error messages from the backend if available
    const errorMessage = e.response?.data?.message || e.message;
    console.error("Error fetching CDT report:", errorMessage, e.response);
    return { success: false, message: 'Error al generar el reporte CDT: ' + errorMessage };
  }
};

