// vertical nav items

export default [
  // {
  //   title: 'Home',
  //   to: { name: 'root' },
  //   icon: { icon: 'ri-home-smile-line' },
  //   // NO tiene meta, por lo que es visible para TODOS
  // },

  {
    heading: 'Inventario',
    // NUEVO: Añadimos meta también a los encabezados para poder ocultar secciones enteras
    meta: {
      requiresSupervisor: true,
    }
  },
  {
    title: 'Usuarios del Sistema',
    to: { name: 'usuarios' },
    icon: { icon: 'ri-user-line' },
    meta: {
      requiresSupervisor: true,
    }
  },
  {
    title: 'Choferes',
    to: { name: 'choferes' },
    icon: { icon: 'ri-steering-2-line' },
    meta: {
      requiresSupervisor: true,
    }
  },
  {
    title: 'Combustibles',
    to: { name: 'combustibles' },
    icon: { icon: 'ri-oil-fill' },
    meta: {
      requiresSupervisor: true,
    }
  },
  {
    title: 'Vehiculos',
    to: { name: 'vehiculos' },
    icon: { icon: 'ri-car-line' },
    meta: {
      requiresSupervisor: true,
    }
  },
  {
    title: 'Tarjetas de combustible',
    to: { name: 'tarjetas' },
    icon: { icon: 'ri-bank-card-line' },
    meta: {
      requiresSupervisor: true,
    }
  },
  {
    title: 'Cargas de combustible',
    to: { name: 'cargas' },
    icon: { icon: 'ri-gas-station-line' },
    // NUEVO: Solo visible para supervisores
  },
  {
    title: 'Salidas de combustible',
    to: { name: 'retiros' },
    icon: { icon: 'ri-oil-line' },
    // NUEVO: Solo visible para supervisores
  },
]