import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";

// TODO: เปลี่ยนเป็นของคุณ เช่น prisma / supabase / drizzle
import { db } from "@/lib/db";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p>กำลังโหลด...</p>}>
      <DeleteContent params={params} />
    </Suspense>
  );
}

async function DeleteContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ดึงข้อมูลสินค้า (แก้ให้ตรงกับ DB ของคุณ)
  const product = await db.product.findUnique({ where: { id } });

  if (!product) notFound();

  // Server Action สำหรับลบ
  async function deleteProduct() {
    "use server";
    await db.product.delete({ where: { id } });
    redirect("/products");
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-bold">ลบสินค้า</h1>
      <p className="mt-2">
        คุณแน่ใจหรือไม่ว่าต้องการลบ <strong>{product.name}</strong>?
      </p>

      <form action={deleteProduct} className="mt-4 flex gap-2">
        <button
          type="submit"
          className="rounded bg-red-600 px-4 py-2 text-white"
        >
          ยืนยันลบ
        </button>
        <a href="/products" className="rounded border px-4 py-2">
          ยกเลิก
        </a>
      </form>
    </div>
  );
}