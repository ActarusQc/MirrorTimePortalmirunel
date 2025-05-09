import { Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-accent" />
            <span className="text-sm text-gray-400">&copy; {new Date().getFullYear()} MirrorTime. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
