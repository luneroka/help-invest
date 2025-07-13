import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-theme-bg-sections">
      {/* Header */}
      <header className="bg-theme-main text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1>HelpInvest</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="card max-w-2xl mx-auto">
          <h2 className="mb-4">
            Welcome to HelpInvest
          </h2>
          <p className="text-body mb-6">
            Your professional portfolio management tool
          </p>
          
          {/* Sample Financial Data */}
          <div className="bg-theme-bg-sections rounded-lg p-4 mb-6">
            <h3 className="mb-2">
              Portfolio Value
            </h3>
            <p className="text-data text-3xl">
              €125,450.00
            </p>
          </div>

          {/* Sample Buttons */}
          <div className="flex gap-4 mb-6">
            <button className="cursor-pointer btn-primary">
              View Portfolio
            </button>
            <button className="cursor-pointer btn-secondary">
              Add Investment
            </button>
          </div>

          {/* Sample Typography Examples */}
          <div className="space-y-4 mb-6">
            <div>
              <h2 className="text-h2-light mb-2">Light H2 Heading</h2>
              <h3 className="text-h3-light mb-2">Light H3 Heading</h3>
            </div>
          </div>

          {/* Sample Link */}
          <div className="mb-6">
            <a href="#" className="link-default">
              Learn more about portfolio management
            </a>
          </div>

          {/* Sample Alerts */}
          <div className="space-y-3">
            <div className="alert-success p-3 rounded">
              <p className="text-small">Portfolio updated successfully!</p>
            </div>
            <div className="alert-warning p-3 rounded">
              <p className="text-small">Review your risk profile settings</p>
            </div>
            <div className="alert-error p-3 rounded">
              <p className="text-small">Unable to connect to market data</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-theme-main text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-theme-accent text-small">
            © 2025 HelpInvest. Professional portfolio management.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
