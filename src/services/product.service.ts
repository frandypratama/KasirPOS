import db from "@/lib/firebase";
import { Product, ProductInput } from "@/types/product";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";



export const productCollection = (uid:string) => {
  return collection(
    db,
    "users",
    uid,
    "products"
  )
}

export const getProducts = async (uid:string): Promise<Product[]> => {
  const productQuery = query(
    productCollection(uid),
    orderBy("createdAt", "desc")
  )

  const snapshot = await getDocs(productQuery)
  return snapshot.docs.map((doc) => ({
    id:doc.id,
    ...doc.data(),
  }))as Product[]  

}

export const addProduct = async (uid:string,input: ProductInput) => {
  await addDoc(productCollection(uid), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export const updateProduct = async (
  uid:string,
  id: string,
  input: ProductInput
) => {
  const productRef = doc(
    productCollection(uid),
    id
  )
  await updateDoc(productRef, {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export const deleteProduct = async (uid:string,id:string) => {
  try {
    const productRef = doc(
      productCollection(uid),
      id
    )
    
    await deleteDoc(productRef)
    
  } catch (error) {
    console.log(error)
  }
}

export const getProductById = async (uid:string,id:string) => {
  const products = await getProducts(uid);

  return products.find((product) => product.id === id)
}