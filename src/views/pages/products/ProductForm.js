export const fetchNextProductCode = async () => {
    try {
        const request = await $axios.get('/products/get-next-product-code');
        return {
            success: request?.data?.success,
            data: request?.data?.data,
            message: request?.data?.message,
            meta: request?.data?.meta
        };
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Error al obtener código",
            data: null,
            meta: null
        };
    }
};

export const submitProduct = async (productData) => {
    try {
        const request = await $axios.post('/products', productData);
        return {
            success: request?.data?.success,
            data: request?.data?.data,
            message: request?.data?.message,
            meta: request?.data?.meta
        };
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Error al crear producto",
            data: error.response?.data?.errors || null,
            meta: null
        };
    }
};

export const fetchChoferes = async () => {
    try {
        const response = await $axios.get('/choferes/get-names');
        return {
            success: true,
            data: response.data.data.map(cat => ({
                title: cat.nombre,
                value: cat.id
            }))
        };
    } catch (error) {
        return {
            success: false,
            message: "Error al cargar categorías"
        };
    }
};

export const fetchSubcategories = async (categoryId) => {
    try {
        const response = await $axios.get(`/subcategories/by-category/${categoryId}`);

        return {
            success: true,
            data: response.data.data.map(sub => ({
                title: sub.name,
                value: sub.id
            }))
        };
    } catch (error) {
        let message = "Error al cargar subcategorías";

        // Manejo específico de errores
        if (error.response) {
            if (error.response.status === 404) {
                message = "Categoría no encontrada";
            } else if (error.response.data?.message) {
                message = error.response.data.message;
            }
        }

        return {
            success: false,
            message: message,
            data: null
        };
    }
};

export const fetchVechicleById = async (id) => {
    try {
        const response = await $axios.get(`/vehiculos/${id}`);

        if (response.data?.success && response.data?.data) {
            const productData = response.data.data;

            return {
                success: true,
                data: {
                    numero_interno: productData.numero_interno,
                    marca: productData.marca,
                    modelo: productData.modelo,
                    tipo_vehiculo: productData.tipo_vehiculo,
                    ano : productData.ano,
                    tipo_combustible_id: productData.tipo_combustible_id,
                    indice_consumo: productData.indice_consumo,
                    prueba_litro: productData.prueba_litro,
                    capacidad_tanque: productData.capacidad_tanque,
                    ficav: productData.ficav,
                    tipo_vehiculo: productData.tipo_vehiculo || productData.tipo_vehiculo?.id || null,

                },
                message: response.data.message
            };
        }
        throw new Error(response.data?.message || 'Estructura de respuesta inválida');
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Error al cargar producto',
            data: null
        };
    }
};

export const updateProduct = async (productId, data) => {
    let message = null;
    let success = null;
    let responseData = null;

    try {
        const request = await $axios.put(`/products/${productId}`, data);

        success = request?.data?.success;
        responseData = request?.data?.data;
        message = request?.data?.message;

        return { success, message, data: responseData };

    } catch (error) {
        message = error?.response?.data?.message || error?.message || "Error al actualizar el producto";
        success = false;
        return { success, message, data: null };
    }
}

export const deleteProduct = async (categoryId) => {
    try {
        const request = await $axios.delete(`/products/${categoryId}`);
        return {
            success: request?.data?.success,
            message: request?.data?.message,
            data: request?.data?.data
        };
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Error al eliminar el producto"
        };
    }
};
