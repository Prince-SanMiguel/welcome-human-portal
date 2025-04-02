
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserIcon, Users, BarChart4, CalendarDays } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-hr-blue mr-2" />
            <h1 className="text-xl font-bold text-gray-900">HR Management System</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-hr-blue">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-hr-blue hover:bg-hr-blue/90">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 auth-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Simplify Your HR Operations
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Your all-in-one platform for employee management, attendance tracking, 
            benefits administration and performance reviews.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              <Button className="text-hr-blue bg-white hover:bg-gray-100 border-2 border-white text-base px-6 py-5">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="bg-transparent text-white hover:bg-white/10 border-2 border-white text-base px-6 py-5">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to manage your workforce
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-lg p-6 shadow-sm">
              <UserIcon className="h-10 w-10 text-hr-blue mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Employee Management</h3>
              <p className="text-gray-600">
                Maintain detailed employee profiles, documents, and career progression all in one place.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-lg p-6 shadow-sm">
              <CalendarDays className="h-10 w-10 text-hr-blue mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Time & Attendance</h3>
              <p className="text-gray-600">
                Track work hours, manage leave requests and monitor attendance with ease.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-lg p-6 shadow-sm">
              <BarChart4 className="h-10 w-10 text-hr-blue mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Reviews</h3>
              <p className="text-gray-600">
                Streamline employee evaluations, set goals and track performance metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to transform your HR processes?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of companies that trust our HR Management System
          </p>
          <Link to="/signup">
            <Button className="bg-hr-blue hover:bg-hr-blue/90 text-lg px-8 py-6">
              Create your account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 mr-2" />
                <span className="text-lg font-semibold">HR Management System</span>
              </div>
              <p className="text-gray-400">
                Comprehensive HR management solution for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white">Log in</Link></li>
                <li><Link to="/signup" className="hover:text-white">Sign up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">info@hrmsystem.com</p>
              <p className="text-gray-400">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} HR Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
