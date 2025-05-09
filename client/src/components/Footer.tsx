import { Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-playfair font-bold">MirrorTime</h2>
            </div>
            <p className="text-sm text-gray-400">Discover the hidden meanings behind mirror and reversed hours</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <a href="#" className="hover:text-accent transition-colors">About</a>
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">FAQ</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} MirrorTime. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
