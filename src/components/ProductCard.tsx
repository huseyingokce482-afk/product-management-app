import Link from "next/link";

/**
 * JSDOC: ProductCard komponentinin alması gereken 'props'ları (bilgileri) tanımlar.
 * @param {object} product - Ekrana basılacak ürünün verilerini içeren obje.
 */
interface ProductCardProps {
  product: {
    productId: string;
    productName: string;
    price: string;
    discountedPrice?: string; // Soru işareti zorunlu olmadığını belirtir
    productImages: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Gelen bilgileri daha okunaklı değişkenlere atayalım
  const { productId, productName, price, discountedPrice, productImages } =
    product;

  /**
   * BUGFIX (HATA DÜZELTME):
   * "Neden?": Eski ürünlerde 'productImages' alanı olmayabilir. Bu durumda
   * productImages.split(',') kodu 'undefined' üzerinden 'split' çağırmaya
   * çalışır ve sayfa çöker.
   * "Çözüm?": (productImages || '') kullanarak, eğer productImages yoksa
   * boş bir metin üzerinde split() çalıştırmasını sağlarız. Bu hatayı engeller.
   */
  const firstImage = (productImages || "").split(",")[0].trim();

  // Fiyat hesaplamaları
  const originalPrice = parseFloat(price);
  const salePrice = discountedPrice ? parseFloat(discountedPrice) : 0;

  let discountPercentage = 0;
  // Fiyatı ve indirimli fiyatı olan, indirimin geçerli olduğu ürünleri hesapla
  if (salePrice > 0 && originalPrice > salePrice) {
    discountPercentage = Math.round(
      ((originalPrice - salePrice) / originalPrice) * 100
    );
  }

  return (
    <Link href={`/products/${productId}`} className="group block">
      {/*
       * STIL GÜNCELLEMESİ:
       * "Neden?": Referans tasarıma (beyaz, gölgeli kart) uymak için.
       * 'overflow-hidden' resmin yuvarlatılmış köşelerden taşmamasını sağlar.
       * 'bg-white' ve 'shadow-md' o temiz görünümü verir.
       */}
      <div className="relative overflow-hidden rounded-lg bg-white shadow-md group-hover:shadow-xl transition-shadow duration-300">
        {/* İndirim Etiketi (Referans tasarımdaki gibi) */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
            %{discountPercentage} İNDİRİM
          </div>
        )}

        {/*
         * STIL GÜNCELLEMESİ:
         * "Neden?": Resmin her zaman kare ve düzgün görünmesi için.
         * 'aspect-square' resim alanının 1:1 (kare) oranında olmasını zorlar.
         * 'object-cover' resmin bu kare alana yayılmasını sağlar.
         */}
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={firstImage || "/placeholder-image.png"} // Güvenli yedek resim
            alt={productName}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Kartın alt bilgi kısmı */}
      <div className="mt-4 px-1">
        <h3 className="text-base font-semibold text-gray-800 group-hover:text-indigo-600">
          {productName}
        </h3>

        {/* Fiyat Bölümü (Referans tasarımdaki gibi) */}
        <div className="mt-2 flex items-baseline space-x-2">
          {salePrice > 0 && originalPrice > salePrice ? (
            // İndirim varsa
            <>
              <p className="text-lg font-bold text-black">
                {salePrice.toFixed(2)} TL
              </p>
              <p className="text-sm text-gray-400 line-through">
                {originalPrice.toFixed(2)} TL
              </p>
            </>
          ) : (
            // İndirim yoksa
            <p className="text-lg font-bold text-black">
              {originalPrice.toFixed(2)} TL
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
