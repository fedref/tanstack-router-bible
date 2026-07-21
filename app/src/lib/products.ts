// 외부 API 없이 학습용으로 쓰는 mock 데이터 + 지연 로더.
// Chapter 04(Data Loading)에서 loader 와 함께 다시 사용한다.

export interface Product {
  id: string
  name: string
  price: number
  category: 'keyboard' | 'mouse' | 'monitor'
}

const PRODUCTS: Product[] = [
  { id: '1', name: 'Mechanical Keyboard', price: 129, category: 'keyboard' },
  { id: '2', name: 'Ergo Mouse', price: 69, category: 'mouse' },
  { id: '3', name: 'Ultrawide Monitor', price: 499, category: 'monitor' },
]

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export function listProducts(): Promise<Product[]> {
  return delay(PRODUCTS)
}

export function getProduct(id: string): Promise<Product | undefined> {
  return delay(PRODUCTS.find((p) => p.id === id))
}
