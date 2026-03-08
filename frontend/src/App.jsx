import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { Compass, LogIn } from 'lucide-react';

function App() {
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log("QuestMap Landing Page Mounted");
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        navigate('/profile');
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.code === 'auth/popup-closed-by-user') return;
      alert(`Login failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">QuestMap</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-400 hover:text-white font-medium transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleGoogleLogin}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all active:scale-95 shadow-lg shadow-white/5"
          >
            <LogIn className="w-4 h-4" />
            Login with Google
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              Learn Anything. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                Level Up.
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
              AI-generated knowledge maps that turn learning into a game.
              Master any topic through structured paths and addictive progression.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex flex-wrap gap-4 justify-center md:justify-start"
          >
            <button
              onClick={() => navigate('/profile')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              Start Your Quest →
            </button>
            <button className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-2xl font-semibold text-lg hover:bg-gray-750 transition-all">
              See a Demo
            </button>
          </motion.div>
        </div>

        {/* Hero Visual Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="flex-1 relative"
        >
          <div className="w-full aspect-square bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[3rem] border border-white/10 flex items-center justify-center backdrop-blur-3xl overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
            <div className="relative text-center p-8">
              <Compass className="w-32 h-32 mx-auto text-blue-500/20 mb-4 animate-pulse" />
              <p className="text-blue-400/50 font-mono text-sm uppercase tracking-widest italic">
                Dynamic Map Generation Pending...
              </p>
            </div>

            {/* Visual Flair */}
            <div className="absolute top-1/4 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-1/4 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[80px]"></div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} QuestMap. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
