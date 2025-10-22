import { useState, useEffect } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

const AddProductPage: NextPage = () => {
  const router = useRouter();

  // Form Değerleri için State'ler
  const [productName, setProductName] = useState("");
  const [sellerInfo, setSellerInfo] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [category, setCategory] = useState("");
  const [productImages, setProductImages] = useState("");
  const [productId, setProductId] = useState("");

  // HATA MESAJLARI için State'ler (Erkan Abi'nin isteği bu)
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  /**
   * Sayfa yüklendiğinde otomatik olarak benzersiz bir ürün ID'si oluşturur.
   */
  useEffect(() => {
    const newId = `product-${Date.now()}`;
    setProductId(newId);
  }, []);

  /**
   * JSDOC: Formu göndermeden önce tüm validasyon kurallarını kontrol eder.
   * "Neden?": Erkan Abi'nin istediği gibi "sakat" veriyi engellemek için.
   * @returns {boolean} - Form geçerliyse true, değilse false döner.
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Kural 1: Zorunlu Alan Kontrolü (İndirimli Fiyat hariç)
    if (!productName) newErrors.productName = "Ürün adı zorunludur.";
    if (!sellerInfo) newErrors.sellerInfo = "Satıcı bilgisi zorunludur.";
    if (!stockQuantity) newErrors.stockQuantity = "Stok adedi zorunludur.";
    if (!price) newErrors.price = "Fiyat zorunludur.";
    if (!category) newErrors.category = "Kategori zorunludur.";
    if (!productImages) newErrors.productImages = "Ürün resmi zorunludur.";

    // Kural 2: Özel Validasyon Kuralları (Regex ile)

    // Ürün Adı: Harf ile başlar
    if (productName && !/^[a-zA-Z]/.test(productName)) {
      newErrors.productName = "Ürün adı bir harf ile başlamalıdır.";
    }

    // Satıcı Bilgisi: Harf/rakam ile başlar, - ve . harici özel karakter içermez
    if (
      sellerInfo &&
      !/^[a-zA-Z0-9çÇğĞıİöÖşŞüÜ][a-zA-Z0-9çÇğĞıİöÖşŞüÜ .-]*$/.test(sellerInfo)
    ) {
      newErrors.sellerInfo =
        "Satıcı bilgisi harf/rakam ile başlamalı ve sadece '-' veya '.' içerebilir.";
    }

    // Stok Adedi: Sadece sayı, eksi olamaz
    if (stockQuantity && !/^[0-9]+$/.test(stockQuantity)) {
      newErrors.stockQuantity =
        "Stok adedi sadece pozitif sayılar içermelidir.";
    }

    // Fiyat: Sayı veya ondalıklı (hem virgül hem nokta kabul et)
    if (price && !/^[0-9]+([,.]?[0-9]*)?$/.test(price)) {
      newErrors.price =
        "Fiyat sadece sayı veya ondalıklı sayı (örn: 100.50) olmalıdır.";
    }

    // İndirimli Fiyat: Varsa, sayı veya ondalıklı
    if (discountedPrice && !/^[0-9]+([,.]?[0-9]*)?$/.test(discountedPrice)) {
      newErrors.discountedPrice =
        "İndirimli fiyat sayı veya ondalıklı sayı olmalıdır.";
    }

    // Fiyat ve İndirimli Fiyat karşılaştırması
    // "Neden replace?": JavaScript 'parseFloat' virgülü anlamaz, noktaya çeviririz.
    const numPrice = parseFloat(price.replace(",", "."));
    const numDiscountedPrice = discountedPrice
      ? parseFloat(discountedPrice.replace(",", "."))
      : 0;

    if (numDiscountedPrice > 0 && numDiscountedPrice >= numPrice) {
      newErrors.discountedPrice =
        "İndirimli fiyat, normal fiyattan düşük olmalıdır.";
    }

    // Kategori: Harf ve boşluk, boşlukla başlamaz
    if (category && !/^[a-zA-Z][a-zA-Z ]*$/.test(category)) {
      newErrors.category =
        "Kategori sadece harf/boşluk içermeli ve harf ile başlamalıdır.";
    }

    // Ürün Resimleri: https ile başlamalı
    if (productImages) {
      // Virgülle ayrılmış tüm linkleri kontrol et
      const urls = productImages.split(",").map((url) => url.trim());
      // Biri bile 'https://' ile başlamıyorsa hata ver
      const invalidUrl = urls.some((url) => url && !/^https:/.test(url));
      if (invalidUrl) {
        newErrors.productImages =
          "Tüm görsel URL'leri 'https://' ile başlamalıdır.";
      }
    }

    setErrors(newErrors); // Hata state'ini güncelle
    // newErrors objesi boşsa (hiç anahtar yoksa) true döner, yani form geçerlidir.
    return Object.keys(newErrors).length === 0;
  };

  /**
   * JSDOC: Form gönderildiğinde bu fonksiyon çalışır.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. ADIM: Validasyonu Kontrol Et
    const isFormValid = validateForm();

    // 2. ADIM: Form Geçerli Değilse, kaydetmeyi durdur.
    if (!isFormValid) {
      console.warn("Form geçerli değil, kayıt işlemi iptal edildi.");
      return; // Fonksiyonu burada bitir. "Sakat" veriyi engelledik.
    }

    // 3. ADIM: Form Geçerliyse, kaydet.
    console.log("Form geçerli, ürün kaydediliyor...");

    const productData = {
      productId,
      productName,
      sellerInfo,
      stockQuantity,
      price: price.replace(",", "."), // Virgülü noktaya çevirip kaydet
      discountedPrice: discountedPrice.replace(",", "."),
      category,
      productImages,
    };

    try {
      const existingProducts = JSON.parse(
        localStorage.getItem("products") || "[]"
      );
      const updatedProducts = [...existingProducts, productData];
      localStorage.setItem("products", JSON.stringify(updatedProducts));

      // GÖREV 3: Erkan Abi 'alert' istemedi.
      // Kayıttan sonra direkt ana sayfaya yönlendir.
      router.push("/");
    } catch (error) {
      console.error("Ürün kaydedilirken bir hata oluştu:", error);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Yeni Ürün Ekle</h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Input grupları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ----- Ürün Adı ----- */}
          <div>
            <label
              htmlFor="productName"
              className="block text-sm font-medium text-gray-700"
            >
              Ürün Adı *
            </label>
            <input
              type="text"
              id="productName"
              className={`mt-1 block w-full p-3 border rounded-md shadow-sm ${
                errors.productName
                  ? "border-red-500" // Hata varsa kenarlık kırmızı
                  : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500`}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            {/* Hata Mesajı Alanı */}
            {errors.productName && (
              <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
            )}
          </div>

          {/* ----- Satıcı Bilgisi ----- */}
          <div>
            <label
              htmlFor="sellerInfo"
              className="block text-sm font-medium text-gray-700"
            >
              Satıcı Bilgisi *
            </label>
            <input
              type="text"
              id="sellerInfo"
              className={`mt-1 block w-full p-3 border rounded-md shadow-sm ${
                errors.sellerInfo ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500`}
              value={sellerInfo}
              onChange={(e) => setSellerInfo(e.target.value)}
            />
            {errors.sellerInfo && (
              <p className="mt-1 text-sm text-red-600">{errors.sellerInfo}</p>
            )}
          </div>

          {/* ----- Stok Adedi ----- */}
          <div>
            <label
              htmlFor="stockQuantity"
              className="block text-sm font-medium text-gray-700"
            >
              Stok Adedi *
            </label>
            <input
              type="text"
              id="stockQuantity"
              className={`mt-1 block w-full p-3 border rounded-md shadow-sm ${
                errors.stockQuantity ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500`}
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
            {errors.stockQuantity && (
              <p className="mt-1 text-sm text-red-600">
                {errors.stockQuantity}
              </p>
            )}
          </div>

          {/* ----- Kategori ----- */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Kategori *
            </label>
            <input
              type="text"
              id="category"
              className={`mt-1 block w-full p-3 border rounded-md shadow-sm ${
                errors.category ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* ----- Fiyat ----- */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Fiyat *
            </label>
            <input
              type="text"
              id="price"
              className={`mt-1 block w-full p-3 border rounded-md shadow-sm ${
                errors.price ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500`}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          {/* ----- İndirimli Fiyat ----- */}
          <div>
            <label
              htmlFor="discountedPrice"
              className="block text-sm font-medium text-gray-700"
            >
              İndirimli Fiyat
            </label>
            <input
              type="text"
              id="discountedPrice"
              className={`mt-1 block w-full p-3 border rounded-md shadow-sm ${
                errors.discountedPrice ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500`}
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
            />
            {errors.discountedPrice && (
              <p className="mt-1 text-sm text-red-600">
                {errors.discountedPrice}
              </p>
            )}
          </div>
        </div>

        {/* ----- Ürün Resimleri ----- */}
        <div>
          <label
            htmlFor="productImages"
            className="block text-sm font-medium text-gray-700"
          >
            Ürün Resimleri (En fazla 5, virgülle ayırın) *
          </label>
          <input
            type="text"
            id="productImages"
            placeholder="https://.../resim1.jpg, https://.../resim2.jpg"
            className={`mt-1 block w-full p-3 border rounded-md shadow-sm ${
              errors.productImages ? "border-red-500" : "border-gray-300"
            } focus:ring-indigo-500 focus:border-indigo-500`}
            value={productImages}
            onChange={(e) => setProductImages(e.target.value)}
          />
          {errors.productImages && (
            <p className="mt-1 text-sm text-red-600">{errors.productImages}</p>
          )}
        </div>

        {/* ----- Ürün ID ----- */}
        <div>
          <label
            htmlFor="productId"
            className="block text-sm font-medium text-gray-700"
          >
            Ürün ID (Otomatik Oluşturuldu)
          </label>
          <input
            type="text"
            id="productId"
            disabled
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
            value={productId}
          />
        </div>

        {/* ----- Butonlar ----- */}
        <div className="flex justify-end space-x-4 pt-4">
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            İptal
          </Link>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ürünü Kaydet
          </button>
        </div>
      </form>
    </main>
  );
};

export default AddProductPage;
