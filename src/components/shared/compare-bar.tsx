'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCompareStore } from '@/stores/compare-store';
import { ArrowRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const CompareBar = () => {
  const router = useRouter();
  const pathName = usePathname()
  const { compareShoes, removeShoe, clearAll } = useCompareStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setIsVisible(compareShoes.length > 0);
    }
  }, [compareShoes.length, isMounted]);

  const handleCompare = () => {
    // Navigate to compare page - API call will happen there
    router.push('/compare');
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Don't render if no shoes selected
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 pb-4 px-4 pointer-events-none ${pathName.startsWith('/compare') ? 'hidden' : ''}`}>
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <Card className={`bg-white/95 backdrop-blur-2xl border-2 border-gray-200/80 shadow-2xl transition-all duration-500 ease-out ${isMinimized
          ? 'shadow-lg hover:shadow-xl'
          : 'shadow-2xl animate-in slide-in-from-bottom-5'
          }`}>
          {/* Minimized View */}
          {isMinimized ? (
            <div className="p-3 flex items-center justify-between animate-in fade-in-0 duration-300 bg-white/40 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  // onClick={() => setIsMinimized(false)}
                  className="flex items-center gap-2 text-gray-900 hover:text-primary transition-all duration-200 group"
                  aria-label="Expand compare bar"
                >
                  <div className="bg-primary/15 rounded-full p-1 group-hover:bg-primary/25 transition-colors">
                    <ChevronUp className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">Compare Shoes</h3>
                    <span className="text-xs text-gray-600">
                      {compareShoes.length}/4 selected
                    </span>
                  </div>
                </button>

                {/* Minimized shoe preview with animation */}
                <div className="flex gap-1.5 ml-2">
                  {compareShoes.slice(0, 4).map((shoe, index) => (
                    <div
                      key={shoe.id}
                      className="w-10 h-10 relative rounded-md border-2 bg-secondary overflow-hidden hover:scale-105 hover:border-primary transition-all duration-200 shadow-sm animate-in zoom-in-50"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Image
                        src={shoe.cardImage || shoe.images[0] || ""}
                        alt={shoe.model}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs h-8 hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleCompare}
                  size="sm"
                  disabled={compareShoes.length < 2}
                  className="gap-1.5 h-8 shadow-md hover:shadow-lg transition-all"
                >
                  Compare
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            /* Expanded View */
            <div className="p-4 animate-in fade-in-0 duration-300 bg-white/40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-900">Compare Shoes</h3>
                    <span className="text-sm text-gray-600">
                      ({compareShoes.length}/4 selected)
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="text-gray-600 hover:text-primary transition-all duration-200 p-1.5 rounded-full hover:bg-primary/10 group flex items-center gap-1"
                    aria-label="Minimize compare bar"
                    title="Minimize"
                  >
                    <ChevronDown className="h-4 w-4 group-hover:scale-110 transition-transform" /> Minimize
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={handleCompare}
                    size="sm"
                    disabled={compareShoes.length < 2}
                    className="gap-2"
                  >
                    Compare Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Render selected shoes */}
                {compareShoes.map((shoe, index) => (
                  <div
                    key={shoe.id}
                    className="relative group bg-secondary/50 rounded-lg overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-lg animate-in zoom-in-95 fade-in-0"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <button
                      onClick={() => removeShoe(shoe.id)}
                      className="absolute top-2 right-2 z-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-110"
                      aria-label="Remove shoe"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    <div className="aspect-square relative bg-secondary group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={shoe.cardImage || shoe.images[0] || ""}
                        alt={shoe.model}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="p-2.5 bg-white">
                      <p className="text-xs text-gray-600 truncate">
                        {shoe.brand} • {shoe.category.name}
                      </p>
                      <p className="font-medium text-sm truncate text-gray-900">{shoe.model}</p>
                      <p className="text-sm font-bold text-primary">${shoe.price}</p>
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: 4 - compareShoes.length }).map((_, index) => (
                  <div
                    onClick={() => router.push('/shoes/all')}
                    key={`empty-${index}`}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white/60 hover:bg-white/80 hover:border-gray-400 transition-all duration-300 animate-in fade-in-0"
                    style={{ animationDelay: `${(compareShoes.length + index) * 100}ms` }}
                  >
                    <p className="text-xs text-gray-600 text-center px-2 font-medium">
                      Select a shoe
                      <br />
                      to compare
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CompareBar;
