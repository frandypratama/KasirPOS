import { FormErrors } from "@/types/error";
import type {
  ProductInput,
  Product,
} from "@/types/product"
import { sampleProducts } from "@/utils/product-storage";

const STORAGE_KEY = "minipos-products";

export const getProductById = (id: string) => {
  const products = getProducts();
  const product = products.find((item) => {
    return item.id === id
  })
  return product ?? null
}

export const updateProduct = (id: string, input: ProductInput) => {
  const products = getProducts()

  const updateProducts = products.map((product) => {
    if(product.id !== id) {
      return product
    }
    return {
      ...product,
      ...input,
      updateAt: new Date().toISOString()
    }
  })
  savedProducts(updateProducts)
  return getProductById(id);
}

export const deleteProduct = (id:string) => {
  const products = getProducts()
  const filteredProducts = products.filter((product) => {
    return product.id !== id
  })
  savedProducts(filteredProducts)
}

export const savedProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}


export function validateProduct(values: ProductInput) {
  const errors: FormErrors = {};
  if (!values.name.trim()) {
    errors.name = 'Nama Produk wajib diisi.';
  }
  if (!values.sku.trim()) {
    errors.sku = 'Sku wajib diisi.';
  }
  if (values.price <= 0) {
    errors.price = 'harga harus lebih dari 0.';
  }
  if (values.stock <= 0) {
    errors.stock = 'Stok tidak boleh minus.';
  }
  return errors
}

export function getProducts() {
  if(typeof window === 'undefined') {
    return sampleProducts;
  }
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if(!saved) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sampleProducts)
    )
    return sampleProducts;
  }
  console.log(saved)
  return JSON.parse(saved) as Product[]
}

export function addProduct(input: ProductInput) {
  const products = getProducts();

  const newProducts: Product = {
    id: crypto.randomUUID(),
    ...input,
  }
  const nextProducts = [newProducts, ...products]
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(nextProducts)
  )
}
