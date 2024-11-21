// src/App.tsx
import OfficeTracker from './components/OfficeTracker'

function App() {
  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 flex justify-center items-start">
      <div className="w-full max-w-4xl mx-auto mt-8">
        <OfficeTracker />
      </div>
    </div>
  )
}

export default App