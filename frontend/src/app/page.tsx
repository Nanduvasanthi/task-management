import Link from "next/link";
import { FaCheckCircle, FaCalendarAlt, FaFilter, FaBell, FaRocket, FaShieldAlt } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Organize Your Work
                <span className="block text-blue-600">Master Your Tasks</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl">
                A sleek, intuitive task management app that helps you stay organized, 
                meet deadlines, and boost productivity. Everything you need in one place.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-all duration-300 border border-gray-300 shadow-md hover:shadow-lg"
                >
                  Login to View Dashboard
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                No credit card required • Free forever for personal use
              </p>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-8 bg-blue-100 rounded-lg flex items-center px-3">
                        <div className="w-4 h-4 border-2 border-blue-400 rounded mr-3"></div>
                        <div className="h-3 bg-blue-200 rounded w-3/4"></div>
                      </div>
                      <div className="h-8 bg-green-100 rounded-lg flex items-center px-3">
                        <div className="w-4 h-4 rounded-full bg-green-400 mr-3"></div>
                        <div className="h-3 bg-green-200 rounded w-2/3"></div>
                      </div>
                      <div className="h-8 bg-purple-100 rounded-lg flex items-center px-3">
                        <div className="w-4 h-4 border-2 border-purple-400 rounded mr-3"></div>
                        <div className="h-3 bg-purple-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-6 w-64 transform -rotate-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                      <div className="h-3 bg-green-400 rounded w-10"></div>
                    </div>
                    <div className="h-24 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                      <FaCheckCircle className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything for Perfect Task Management
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaCheckCircle className="w-8 h-8" />,
                title: "Smart Task Tracking",
                description: "Create, update, and complete tasks with ease. Visual status indicators keep you on track.",
                color: "bg-blue-100 text-blue-600"
              },
              {
                icon: <FaCalendarAlt className="w-8 h-8" />,
                title: "Due Date Management",
                description: "Set deadlines, get reminders, and never miss an important task again.",
                color: "bg-green-100 text-green-600"
              },
              {
                icon: <FaFilter className="w-8 h-8" />,
                title: "Advanced Filtering",
                description: "Filter tasks by status, priority, or tags. Find exactly what you need instantly.",
                color: "bg-purple-100 text-purple-600"
              },
              {
                icon: <FaBell className="w-8 h-8" />,
                title: "Smart Notifications",
                description: "Get notified about upcoming deadlines and important updates.",
                color: "bg-orange-100 text-orange-600"
              },
              {
                icon: <FaRocket className="w-8 h-8" />,
                title: "Quick Actions",
                description: "Keyboard shortcuts and bulk operations for power users.",
                color: "bg-red-100 text-red-600"
              },
              {
                icon: <FaShieldAlt className="w-8 h-8" />,
                title: "Secure & Private",
                description: "Your data is encrypted and secure. We never share your information.",
                color: "bg-indigo-100 text-indigo-600"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className={`inline-flex p-3 rounded-lg ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Simple & Effective Workflow
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our intuitive three-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create & Organize",
                description: "Add tasks, set priorities, and categorize with tags. Keep everything organized."
              },
              {
                step: "02",
                title: "Track & Update",
                description: "Monitor progress, update statuses, and stay on top of your deadlines."
              },
              {
                step: "03",
                title: "Complete & Analyze",
                description: "Mark tasks as done, review productivity, and optimize your workflow."
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white text-2xl font-bold rounded-full mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white border-y border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "100K+", label: "Tasks Managed" },
              { value: "95%", label: "On-time Completion" },
              { value: "4.8/5", label: "User Rating" },
              { value: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">
                  {stat.value}
                </div>
                <div className="mt-2 text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Your Productivity?
            </h2>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
              Join thousands who have mastered their tasks with our intuitive platform.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Managing Tasks Now
              </Link>
              <p className="mt-4 text-blue-200 text-sm">
                Free forever for personal use • No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
}

