'use client';

// ...existing imports...

export default function HomePage() {
  // ...existing state and handlers...

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                MediaHub
              </h1>
            </div>
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link href="/upload">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    Upload Media
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-8 animate-fade-in-down">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Manage Your Media
            </span>
            <br />
            <span className="text-gray-900">With Ease</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 animate-fade-in-up">
            Upload, organize, and share your media content seamlessly.
            Your one-stop platform for all your media management needs.
          </p>
          <div className="flex justify-center gap-4 animate-fade-in-up">
            {isLoggedIn ? (
              <Link href="/upload">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  Upload Now
                </button>
              </Link>
            ) : (
              <Link href="/login">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  Get Started
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Easy Upload",
              description: "Quick and secure media uploads to the cloud",
              icon: "⚡"
            },
            {
              title: "Smart Organization",
              description: "Automatically organize your media files",
              icon: "🗂️"
            },
            {
              title: "Secure Storage",
              description: "Your media is stored safely and securely",
              icon: "🔒"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="text-4xl mb-4 block">{feature.icon}</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-transparent to-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">© 2024 MediaHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
