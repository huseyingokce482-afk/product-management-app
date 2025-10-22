import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // <-- Next.js'in yönlendiricisini içe aktardık
import type { NextPage } from "next";

// Ana sayfada tanımladığımız Product interface'ini burada da kullanabiliriz
// Veya daha iyisi, bunu src/interfaces/product.ts gibi global bir dosyaya taşırız
// Şimdilik burada tekrar tanımlayalım:
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

const ProductDetailPage: NextPage = () => {
  /**
   * Neden useRouter?
   * URL'deki o sihirli ID'yi ('.../products/product-12345') okuyabilmemiz
   * için Next.js'in 'useRouter' kancasına ihtiyacımız var.
   */
  const router = useRouter();
  const { id } = router.query; // URL'den 'id' parametresini çekiyoruz

  // Bulduğumuz ürünü saklamak için bir state (hafıza kutusu)
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Neden useEffect?
   * Bu kodun, sayfa yüklendiğinde ve URL'deki 'id' belli olduğunda
   * çalışmasını istiyoruz. 'id' değiştiğinde tekrar çalışıp doğru ürünü bulmalı.
   */
  useEffect(() => {
    // 'id' henüz yüklenmediyse (sayfa ilk açılırken) veya yoksa, bir şey yapma
    if (!id) {
      return;
    }

    try {
      // 1. localStorage'dan TÜM ürünleri çek
      const allProducts: Product[] = JSON.parse(
        localStorage.getItem("products") || "[]"
      );

      // 2. Tüm ürünler içinde, ID'si URL'deki ID ile eşleşen ürünü BUL
      const foundProduct = allProducts.find((p) => p.productId === id);

      if (foundProduct) {
        setProduct(foundProduct); // Ürünü bulduk, state'e kaydet
      } else {
        console.error("Ürün bulunamadı!");
        setProduct(null); // Ürün bulunamadı
      }
    } catch (error) {
      console.error("Hata:", error);
      setProduct(null);
    } finally {
      setLoading(false); // Yükleme bitti (başarılı veya başarısız)
    }
  }, [id]); // Bu kanca 'id' değiştiğinde tekrar çalışır

  // ----- Ekrana Çizdirme (Render) Bölümü -----

  if (loading) {
    return <p>Yükleniyor...</p>; // Yüklenirken gösterilecek ekran
  }

  if (!product) {
    return <p>Ürün bulunamadı.</p>; // Ürün bulunamadıysa gösterilecek ekran
  }

  // Ürün başarıyla bulunduysa, bilgilerini ekrana bas
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{product.productName}</h1>
      <p className="text-xl mt-2">{product.price} TL</p>
      <p className="mt-4">Stok: {product.stockQuantity}</p>
      {/*
        BURAYI BİRLİKTE GELİŞTİRECEĞİZ:
        - Sol tarafa resim galerisi (Carousel)
        - Sağ tarafa adet seçici ve 'Sepete Ekle' butonu
      */}
    </main>
  );
};

export default ProductDetailPage;
