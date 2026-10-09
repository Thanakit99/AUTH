import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProduct } from "@/lib/products";
import { deleteProductAction } from "@/app/actions";

type DeleteProductPageProps = {
  params: Promise<{ id: string }>;
};

async function DeleteProductContent({ params }: DeleteProductPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const { id } = await params;
  const product = getProduct(id);
  if (!product) {
    notFound();
  }

  const deleteAction = deleteProductAction.bind(null, product.id);

  return (
    <main>
      <h1>ยืนยันการลบ</h1>
      <p>ต้องการลบสินค้า &quot;{product.name}&quot; หรือไม่?</p>
      <div>
        <form action={deleteAction}>
          <button type="submit">ยืนยันการลบ</button>
        </form>
        <Link href="/">ยกเลิก</Link>
      </div>
    </main>
  );
}

export default function DeleteProductPage({ params }: DeleteProductPageProps) {
  return (
    <Suspense fallback={<main><p>กำลังโหลดข้อมูล...</p></main>}>
      <DeleteProductContent params={params} />
    </Suspense>
  );
}