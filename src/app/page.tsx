import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { fetchProducts, defaultQuery, SearchQuery } from "@/lib/products";
import { AuthButtons } from "./auth-buttons";

async function ProductListContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; limit?: string; sortBy?: string }>;
}) {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  const resolvedParams = await searchParams;
  const query: SearchQuery = {
    q: resolvedParams.q ?? defaultQuery.q,
    limit: resolvedParams.limit ? Number(resolvedParams.limit) : defaultQuery.limit,
    sortBy: (resolvedParams.sortBy as any) ?? defaultQuery.sortBy,
  };

  let productList = { products: [], total: 0, skip: 0, limit: 10 };
  try {
    productList = await fetchProducts(query);
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="w-full bg-white p-6 rounded-2xl border-2 border-stone-300 shadow-xs flex-grow flex flex-col gap-6">
      <h2 className="text-base font-bold text-stone-700">รายการสินค้าทั้งหมด</h2>

      {/* แผงควบคุม (ปุ่มโหลดข้อมูล + ค้นหา) */}
      <div className="w-full bg-[#f8f6f0] p-4 rounded-xl border-2 border-stone-200 flex flex-wrap items-center gap-4">
        <form method="GET" className="flex flex-wrap items-center gap-3 w-full">
          <button type="submit" className="minimal-btn">
            📥 โหลดข้อมูล
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-600 font-medium">จำนวน:</span>
            <input
              type="number"
              name="limit"
              defaultValue={query.limit}
              className="minimal-input w-20 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-grow max-w-xs">
            <input
              type="text"
              name="q"
              placeholder="ค้นหาชื่อสินค้า..."
              defaultValue={query.q}
              className="minimal-input w-full text-sm"
            />
          </div>
          <button type="submit" className="minimal-btn-primary">
            🔍 ค้นหา
          </button>
        </form>
      </div>

      {/* ตารางแสดงรายการสินค้า */}
      <div className="w-full overflow-x-auto rounded-xl border-2 border-stone-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f4f1ea] text-stone-700 text-sm font-bold border-b-2 border-stone-200">
              <th className="p-3.5 border-r border-stone-200">ชื่อสินค้า</th>
              <th className="p-3.5 border-r border-stone-200">ราคา</th>
              <th className="p-3.5 border-r border-stone-200">คงเหลือ</th>
              <th className="p-3.5 border-r border-stone-200">หมวดหมู่</th>
              <th className="p-3.5 border-r border-stone-200 text-center">รูปประกอบ</th>
              {isLoggedIn && <th className="p-3.5 text-center">จัดการ</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 text-sm">
            {productList.products.map((product: any) => (
              <tr key={product.id} className="hover:bg-[#fcfbf9] transition-colors">
                <td className="p-3.5 font-semibold text-stone-800 border-r border-stone-100">{product.title}</td>
                <td className="p-3.5 text-stone-900 font-bold border-r border-stone-100">฿{product.price?.toLocaleString()}</td>
                <td className="p-3.5 text-stone-600 border-r border-stone-100">{product.stock}</td>
                <td className="p-3.5 border-r border-stone-100">
                  <span className="minimal-tag">{product.category}</span>
                </td>
                <td className="p-3.5 text-center border-r border-stone-100">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-lg mx-auto border-2 border-stone-300 shadow-2xs"
                    />
                  ) : (
                    <span className="text-stone-400 text-xs">ไม่มีรูป</span>
                  )}
                </td>
                {isLoggedIn && (
                  <td className="p-3.5 text-center">
                    <div className="flex justify-center gap-2">
                      <Link href={`/products/${product.id}/edit`} className="minimal-btn !py-1 !px-3 !text-xs !bg-stone-50">
                        ✏️ แก้ไข
                      </Link>
                      <Link href={`/products/${product.id}/delete`} className="minimal-btn !py-1 !px-3 !text-xs !bg-stone-100 text-red-600 border-red-300 shadow-[0_3px_0_#fca5a5]">
                        🗑️ ลบ
                      </Link>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {productList.products.length === 0 && (
              <tr>
                <td colSpan={isLoggedIn ? 6 : 5} className="text-center py-16 text-stone-400">
                  ไม่พบรายการสินค้า กดปุ่ม "โหลดข้อมูล" เพื่อแสดงสินค้า 🌱
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; limit?: string; sortBy?: string }>;
}) {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  return (
    <main className="w-full min-h-screen px-6 py-6 flex flex-col bg-[#fcfbf9] box-border">
      {/* ส่วนหัวเว็บมินิมอล */}
      <header className="w-full flex justify-between items-center bg-white p-5 rounded-2xl border-2 border-stone-300 shadow-xs mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏷️</span>
          <div>
            <h1 className="text-xl font-bold text-stone-800 tracking-wide">
              Product
            </h1>
            <p className="text-xs text-stone-500">รักนะจุ๊บุๆ ✨</p>
          </div>
        </div>
        <AuthButtons isLoggedIn={isLoggedIn} userName={session?.user?.name} />
      </header>

      {/* ใช้ Suspense ครอบคอมโพเนนต์ที่ใช้ searchParams เพื่อแก้ปัญหา Build Error */}
      <Suspense fallback={<div className="p-6 text-center text-stone-400">กำลังโหลดข้อมูล...</div>}>
        <ProductListContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}