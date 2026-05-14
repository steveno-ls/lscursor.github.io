import { Section } from '@lightspeed/unified-components-helios-theme/react'
import { UsersPage } from './UsersPage'

function App() {
  return (
    <Section
      appearance="secondary"
      contentWidth="wide"
      paddingTop="large"
      paddingBottom="large"
      customClasses={{
        container: ['min-h-screen', 'bg-neutral-topmost'],
      }}
    >
      <UsersPage />
    </Section>
  )
}

export default App
