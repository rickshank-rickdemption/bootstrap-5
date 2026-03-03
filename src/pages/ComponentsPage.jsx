import { useLocation } from 'react-router-dom'

function ComponentsPage() {
  const location = useLocation()
  const query = location.search || ''
  const theme = localStorage.getItem('theme') === 'light' ? 'light' : 'dark'

  return (
    <iframe
      title="Legacy Components"
      src={`/legacy/components.html${query}`}
      style={{
        width: '100%',
        height: '100vh',
        border: 0,
        display: 'block',
        background: theme === 'light' ? '#ffffff' : '#000',
      }}
    />
  )
}

export default ComponentsPage
