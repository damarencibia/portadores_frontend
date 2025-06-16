export const fetchCards = async (page, itemsPerPage,search,chofer_id,tipo_combustible_id,activa) => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/tarjetas-combustible`, {
            params: {
                page,
                itemsPerPage,
                search,
                chofer_id,
                tipo_combustible_id,
                activa
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

export const fetchConsumoCombustibleReport = async (year, month) => {
    let message = null;
    let success = null;
    let data = null;

    try {
        // Petición GET al endpoint correcto
        const request = await $axios.get(`/tarjetas-combustible/reportes/consumo-mes`, {
            // La clave está en usar el objeto 'params' para las peticiones GET.
            // Esto construirá la URL así: .../consumo-mes?year=2024&month=6
            params: {
                year,
                month
            }
        });
        
        success = request?.data?.success;
        data = request?.data?.data;
        message = request?.data?.message;
        
        return { success, message, data };

    } catch (error) {
        message = error?.response?.data?.message || error?.message || "Ocurrió un error al generar el reporte.";
        success = false;
        return { success, message, data: null };
    }
};


export const exportConsumoCombustiblePDF = async (year, month, tarjeta_id = null) => {
    let message = null;
    let success = false; // Por defecto es false, se actualizará si hay éxito
    let file = null; // Para almacenar el blob del archivo

    try {
        const response = await $axios.get(
            `/tarjetas-combustible/reportes/consumo-mes`, // Nueva ruta para el PDF
            {
                params: {
                    year,
                    month,
                    tarjeta_id // Asegúrate de que tu backend espera este parámetro
                },
                responseType: 'blob' // CRUCIAL: le dice a Axios que espere un archivo binario
            }
        );

        // Si la respuesta es un PDF, success es true y el archivo es el blob
        if (response.headers['content-type'] === 'application/pdf') {
            success = true;
            file = response.data; // El blob del PDF
            message = 'PDF generado con éxito.';
        } else {
            // Manejar posibles errores devueltos como JSON (si el backend los envía así)
            const errorText = await new Response(response.data).text();
            const errorJson = JSON.parse(errorText);
            message = errorJson.message || 'Error desconocido al generar el PDF.';
        }

        return { success, message, file };

    } catch (error) {
        console.error('Error al exportar PDF:', error);
        // Si el error tiene una respuesta del servidor
        if (error.response && error.response.data) {
            try {
                // Intenta parsear el error como JSON si el servidor devuelve un objeto de error
                const errorData = await new Response(error.response.data).text();
                const errorJson = JSON.parse(errorData);
                message = errorJson.message || errorJson.error || 'Error del servidor al generar el PDF.';
            } catch (parseError) {
                // Si no se puede parsear como JSON, usa el mensaje de error http
                message = error.response.statusText || 'Error de red al generar el PDF.';
            }
        } else {
            message = error.message || "Ocurrió un error inesperado al generar el PDF.";
        }
        return { success: false, message, file: null };
    }
}


export const generateCdtPdfReport = async (year, month, tarjeta_id = null) => {
    let message = null;
    let success = false; // Por defecto es false, se actualizará si hay éxito
    let file = null; // Para almacenar el blob del archivo

    try {
        const response = await $axios.get(
            `/vehiculos/reportes/cdt`, // Nueva ruta para el PDF
            {
                params: {
                    year,
                    month,
                    tarjeta_id // Asegúrate de que tu backend espera este parámetro
                },
                responseType: 'blob' // CRUCIAL: le dice a Axios que espere un archivo binario
            }
        );

        // Si la respuesta es un PDF, success es true y el archivo es el blob
        if (response.headers['content-type'] === 'application/pdf') {
            success = true;
            file = response.data; // El blob del PDF
            message = 'PDF generado con éxito.';
        } else {
            // Manejar posibles errores devueltos como JSON (si el backend los envía así)
            const errorText = await new Response(response.data).text();
            const errorJson = JSON.parse(errorText);
            message = errorJson.message || 'Error desconocido al generar el PDF.';
        }

        return { success, message, file };

    } catch (error) {
        console.error('Error al exportar PDF:', error);
        // Si el error tiene una respuesta del servidor
        if (error.response && error.response.data) {
            try {
                // Intenta parsear el error como JSON si el servidor devuelve un objeto de error
                const errorData = await new Response(error.response.data).text();
                const errorJson = JSON.parse(errorData);
                message = errorJson.message || errorJson.error || 'Error del servidor al generar el PDF.';
            } catch (parseError) {
                // Si no se puede parsear como JSON, usa el mensaje de error http
                message = error.response.statusText || 'Error de red al generar el PDF.';
            }
        } else {
            message = error.message || "Ocurrió un error inesperado al generar el PDF.";
        }
        return { success: false, message, file: null };
    }
}