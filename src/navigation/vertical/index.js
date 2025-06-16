// vertical nav items

export default [
  {
    title: 'Home',
    to: { name: 'root' },
    icon: { icon: 'ri-home-smile-line' },
  },

  { heading: 'Inventario' },
  {
    title: 'Vehiculos',
    to: { name: 'vehiculos' },
    icon: { icon: 'ri-car-line' }, // 🚗 Vehículos
  },
  {
    title: 'Tarjetas de combustible',
    to: { name: 'tarjetas' },
    icon: { icon: 'ri-bank-card-line' }, // 💳 Tarjetas
  },
  {
    title: 'Cargas de combustible',
    to: { name: 'cargas' },
    icon: { icon: 'ri-gas-station-line' }, // ⛽️ Carga
  },
  {
    title: 'Salidas de combustible',
    to: { name: 'retiros' },
    icon: { icon: 'ri-oil-line' }, // 🛢️ Retiro (más genérico)
  },
]
