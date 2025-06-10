export const fetchVechicles = async (page, itemsPerPage,search,chofer_id, tipo_combustible_id,estado_tecnico,tipo_vehiculo) => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/vehiculos`, {
            params: {
                page,
                itemsPerPage,
                search,
                chofer_id,
                tipo_combustible_id,
                estado_tecnico,
                tipo_vehiculo
            }
        })

        success = request?.data?.success;
        data = request?.data?.data
        message = request?.data?.message;
        meta = request?.data?.meta;
        return { success, message, data, meta }

    } catch (error) {
        message = error?.response?.data?.message || error || "Ocurrió un error al actualizar el evento";

        success = false;
        return { success, message, data, meta }

    }

}

export const fetchChoferNames = async () => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/choferes/get-names`,)
        
        success = request?.data?.success;
        data = request?.data?.data
        message = request?.data?.message;
        meta = request?.data?.meta;
        return { success, message, data, meta }

    } catch (error) {
        message = error?.response?.data?.message || error || "Ocurrió un error al actualizar el evento";

        success = false;
        return { success, message, data, meta }

    }
}

export const fetchTipoCombustibleNames = async () => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/tipo-combustibles/get-names`,)
        
        success = request?.data?.success;
        data = request?.data?.data
        message = request?.data?.message;
        meta = request?.data?.meta;
        return { success, message, data, meta }

    } catch (error) {
        message = error?.response?.data?.message || error || "Ocurrió un error al actualizar el evento";

        success = false;
        return { success, message, data, meta }

    }
}

export const updateVehicle = async (vehicleId, data) => {
    let message = null;
    let success = null;
    let responseData = null;

    try {
        const request = await $axios.put(`/products/${vehicleId}`, data);
        
        success = request?.data?.success;
        responseData = request?.data?.data;
        message = request?.data?.message;
        
        return { success, message, data: responseData };

    } catch (error) {
        message = error?.response?.data?.message || error?.message || "Error al actualizar el producto";
        success = false;
        return { success, message, data: null };
    }
};


