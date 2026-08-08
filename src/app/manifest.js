export default function manifest() {
  return {
    name: 'Planificador de Horarios UNAC 2026-B',
    short_name: 'Horario UNAC',
    description: 'Arma tu horario fácilmente y expórtalo a PDF nativo o Excel.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
