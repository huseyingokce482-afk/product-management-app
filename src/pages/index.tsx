import type { NextPage } from "next";
import Link from "next/link"; // <-- BU SATIRI EKLE

const HomePage: NextPage = () => {
  return (
    <div>
      <h1>Ürün Listeleme Sayfası</h1>
      <Link href="/add-product">Ürün Ekle</Link>
    </div>
  );
};

export default HomePage;
