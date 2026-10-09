import { z } from "zod";

export const CATEGORIES = [
  "beauty", "fragrances", "furniture", "groceries",
  "home-decoration", "kitchen-accessories", "laptops",
  "mens-shirts", "mens-shoes", "mens-watches",
  "mobile-accessories", "motorcycle", "skin-care",
  "smartphones", "sports-accessories", "sunglasses",
  "tablets", "tops", "vehicle", "womens-bags",
  "womens-dresses", "womens-jewellery", "womens-shoes", "womens-watches",
] as const;

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string().trim().min(1, "กรุณากรอกชื่อสินค้า"),
  price: z.number({ error: "กรุณากรอกราคา" }).min(0, "ราคาต้องไม่ติดลบ"),
  stock: z
    .number({ error: "กรุณากรอกจำนวนคงเหลือ" })
    .int("จำนวนคงเหลือต้องเป็นจำนวนเต็ม")
    .min(0, "จำนวนคงเหลือต้องไม่ติดลบ"),
  category: z.enum(CATEGORIES, { error: "กรุณาเลือกหมวดหมู่" }),
  description: z.string().optional(),
  thumbnail: z.string().optional(), // เพิ่มฟิลด์รูปภาพประกอบ
});

export const ProductListSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type Product = z.infer<typeof ProductSchema> & { 
  description?: string; 
  name?: string; 
  thumbnail?: string;
};

export type ProductList = z.infer<typeof ProductListSchema>;

export const ProductDraftSchema = ProductSchema.omit({ id: true });
export type ProductDraft = z.infer<typeof ProductDraftSchema>;

export const SORT_FIELDS = ["title", "price", "stock"] as const;

export const SearchQuerySchema = z.object({
  q: z.string().trim(),
  limit: z
    .number({ error: "กรุณากรอกจำนวนรายการ" })
    .int("จำนวนรายการต้องเป็นจำนวนเต็ม")
    .min(1, "อย่างน้อย 1 รายการ")
    .max(30, "ไม่เกิน 30 รายการ"),
  sortBy: z.enum(SORT_FIELDS),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const defaultQuery: SearchQuery = {
  q: "",
  limit: 10,
  sortBy: "title",
};

const API_BASE = "https://dummyjson.com";

export function buildProductUrl(query: SearchQuery): string {
  const params = new URLSearchParams();
  params.set("q", query.q);
  params.set("limit", String(query.limit));
  params.set("sortBy", query.sortBy);
  params.set("order", "asc");
  params.set("select", "title,price,stock,category,thumbnail"); // ดึง thumbnail มาด้วย
  return `${API_BASE}/products/search?${params.toString()}`;
}

export async function fetchProducts(query: SearchQuery): Promise<ProductList> {
  const response = await fetch(buildProductUrl(query));
  if (!response.ok) {
    throw new Error(`เรียกข้อมูลไม่สำเร็จ สถานะ ${response.status}`);
  }
  const data = await response.json();
  const result = ProductListSchema.safeParse(data);
  if (!result.success) {
    throw new Error("รูปแบบข้อมูลที่ได้รับไม่ตรงกับที่กำหนดไว้");
  }
  return result.data;
}

// สำหรับระบบจัดการใน memory
let memoryProducts: Product[] = [];

export function setMemoryProducts(products: Product[]) {
  memoryProducts = products;
}

export function getProducts(): Product[] {
  return memoryProducts.map((p) => ({
    ...p,
    name: p.title,
  }));
}

export function getProduct(id: number | string): Product | undefined {
  const numId = Number(id);
  const p = memoryProducts.find((item) => item.id === numId);
  if (!p) return undefined;
  return { ...p, name: p.title };
}

export function updateProduct(
  id: number | string,
  values: Pick<Product, "title" | "price" | "stock" | "category" | "description"> & { name?: string }
) {
  const numId = Number(id);
  const product = memoryProducts.find((p) => p.id === numId);
  if (!product) {
    throw new Error("Product not found");
  }
  product.title = values.title ?? values.name ?? product.title;
  product.price = values.price;
  product.stock = values.stock;
  product.category = values.category;
  if (values.description !== undefined) {
    product.description = values.description;
  }
}

export function deleteProduct(id: number | string) {
  const numId = Number(id);
  const index = memoryProducts.findIndex((p) => p.id === numId);
  if (index === -1) {
    throw new Error("Product not found");
  }
  memoryProducts.splice(index, 1);
}