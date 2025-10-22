import { useState, useEffect } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import ProductCard from "../components/ProductCard"; // Komponentimizi çağırıyoruz

// TypeScript için tam ürün tanımı
interface Product {
  productId: string;
  productName: string;
  price: string;
  discountedPrice?: string;
  productImages: string;
  sellerInfo: string;
  stockQuantity: string;
  category: string;
}

const HomePage: NextPage = () => {
  const [products, setProducts] = useState<Product[]>([]);

  /**
   * JSDOC: Sayfa yüklendiğinde localStorage'dan ürünleri çeker.
   * "Neden useEffect?": localStorage sadece tarayıcıda çalışır.
   * Bu kanca, kodun sunucuda değil, tarayıcıda çalışmasını sağlar.
   */
  useEffect(() => {
    try {
      const savedProducts = JSON.parse(
        localStorage.getItem("products") || "[]"
      );
      setProducts(savedProducts);
    } catch (error) {
      console.error("localStorage'dan ürünler çekilirken hata:", error);
      // Hatalı veriyi temizle
      localStorage.removeItem("products");
    }
  }, []); // Boş dizi, sadece bir kez çalıştırır

  return (
    // STIL GÜNCELLEMESİ: 'max-w-7xl' (~1280px), Erkan Abi'nin 1200px kuralına uyar.
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          Ürünler
        </h1>
        <Link
          href="/add-product"
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow"
        >
          + Yeni Ürün Ekle
        </Link>
      </div>

      {/* Ürün Izgarası (Grid) */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      ) : (
        // Hiç ürün yoksa gösterilecek ekran
        <div className="text-center py-24 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900">
            Mağazanızda henüz ürün yok.
          </h2>
          <p className="mt-2 text-base text-gray-500">
            Hadi ilk ürünü ekleyerek satışa başla!
          </p>
        </div>
      )}
    </main>
  );
};

export default HomePage;
