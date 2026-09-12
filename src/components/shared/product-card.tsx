'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCompareStore } from "@/stores/compare-store";
import { Check, Dot, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shoe } from "../../types/shoe";

interface ProductCardProps {
  product: Shoe;
  theme: string;
}

const ProductCard = ({
  product
}: ProductCardProps) => {

  const router = useRouter();


  const { toast } = useToast();
  const addShoe = useCompareStore((state) => state.addShoe);
  const removeShoe = useCompareStore((state) => state.removeShoe);
  const canAddMore = useCompareStore((state) => state.canAddMore);
  const isInCompare = useCompareStore((state) => state.isShoeInCompare(product.id));
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInCompare) {
      // Remove from compare
      removeShoe(product.id);
      toast({
        title: "Removed from Compare",
        description: `${product.model} has been removed from compare list.`,
      });
    } else {
      // Add to compare
      if (!canAddMore()) {
        toast({
          title: "Compare List Full",
          description: "You can compare up to 4 shoes at a time. Remove a shoe to add another.",
          variant: "destructive",
        });
        return;
      }

      const success = addShoe(product);

      if (success) {

        toast({
          title: "Added to Compare",
          description: product.model,
          size: "sm",
          className: "max-w-[250px]",
        });
      }
    }
  };
  return (
    <Card onClick={() => router.push(`/shoes/${product.id}`)} className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="bg-secondary flex items-center justify-center h-64 2xl:h-60">
        <Image unoptimized src={product.cardImage || product?.images[0] || ""} alt={product.model} width={500} height={500} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>

      <div className="p-6 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            {product.brand} <span className="inline"><Dot className="inline" /></span> <span className="text-primary">{product.category.name}</span>
          </p>
          <h3 className="text-2xl font-semibold mt-1 line-clamp-1">{product.model}</h3>
        </div>

        <div className="flex justify-between items-center gap-3">
          <div>
            <p className="text-muted-foreground text-[15px]">Cushion</p>
            <p className="font-medium ">
              {Array.isArray(product.cushion) ? product.cushion.join(", ") : product.cushion}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-[15px]">Weight(oz)</p>
            <p className="font-medium">{product.weight}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-[15px]">Plate</p>
            <p className="font-medium">
              {Array.isArray(product.plate) ? product.plate.join(", ") : product.plate}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center gap-3 pt-3">
          <div>
            <p className="text-muted-foreground text-[15px]">Midsole Drop(mm)</p>
            <p className="font-medium">{product.midsoleDrop}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-[15px]">Stack Height(mm)</p>
            <p className="font-medium">{product.heelStack}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-[15px]">Price</p>
            <p className="font-bold text-2xl">${product.price}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/shoes/${product.id}`}>Details</Link>
          </Button>
          <Button
            className="flex-1 gap-1.5"
            onClick={handleCompareClick}
            variant={isInCompare ? "secondary" : "default"}
            disabled={!isMounted || isInCompare}
            title={isInCompare ? "Already in compare list. Remove from compare bar below." : "Add to compare"}
          >
            {isInCompare ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Compare
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
