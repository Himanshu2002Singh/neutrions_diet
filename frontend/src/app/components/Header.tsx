
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';


interface HeaderProps {
  onLoginClick: () => void;
  onHealthProfileClick: () => void;
}


export function Header({ onLoginClick, onHealthProfileClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="bg-[#F8D94E] rounded-2xl px-4 lg:px-8 py-4 mb-6 relative">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <h1 className="text-xl lg:text-2xl font-bold">NEUTRION DIET</h1>
          
          {/* Desktop Navigation */}

          <nav className="hidden lg:flex gap-6 xl:gap-8">
            <a href="#ingredients" className="hover:opacity-70 transition-opacity text-sm xl:text-base">
              Ingredients
            </a>
           
            <button 
              onClick={onHealthProfileClick}
              className="hover:opacity-70 transition-opacity text-sm xl:text-base text-left"
            >
              Health Profile
            </button>
            <a href="#recipes" className="hover:opacity-70 transition-opacity text-sm xl:text-base">
              Recipes
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            <button className="p-2 hover:opacity-70 transition-opacity">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:opacity-70 transition-opacity">
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button 
              onClick={onLoginClick}
              className="bg-black text-white px-4 xl:px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm xl:text-base"
            >
              Login
            </button>
            <button className="bg-[#FF6B4A] text-white px-4 xl:px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm xl:text-base">
              Order Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="lg:hidden p-2 hover:opacity-70 transition-opacity"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#F8D94E] rounded-b-2xl shadow-lg z-50 border-t border-yellow-300">
            <nav className="flex flex-col px-4 py-6 space-y-4">
              <a 
                href="#ingredients" 
                onClick={closeMenu}
                className="hover:opacity-70 transition-opacity py-2 border-b border-yellow-300 last:border-b-0"
              >
                Ingredients
              </a>
              <a 
                href="#nutritions" 
                onClick={closeMenu}
                className="hover:opacity-70 transition-opacity py-2 border-b border-yellow-300 last:border-b-0"
              >
                Nutritions
              </a>

              <a 
                href="#dishes" 
                onClick={closeMenu}
                className="hover:opacity-70 transition-opacity py-2 border-b border-yellow-300 last:border-b-0"
              >
                Our Dishes
              </a>
              <button 
                onClick={() => {
                  onHealthProfileClick();
                  closeMenu();
                }}
                className="hover:opacity-70 transition-opacity py-2 border-b border-yellow-300 last:border-b-0 text-left"
              >
                Health Profile
              </button>
              <a 
                href="#recipes" 
                onClick={closeMenu}
                className="hover:opacity-70 transition-opacity py-2 border-b border-yellow-300 last:border-b-0"
              >
                Recipes
              </a>
              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={closeMenu}
                  className="p-2 hover:opacity-70 transition-opacity self-start"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button 
                  onClick={closeMenu}
                  className="p-2 hover:opacity-70 transition-opacity self-start"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    onLoginClick();
                    closeMenu();
                  }}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  Login
                </button>
                <button 
                  onClick={closeMenu}
                  className="bg-[#FF6B4A] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  Order Now
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={closeMenu}
        />
      )}
    </>
  );
}
