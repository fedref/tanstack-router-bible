import { queryOptions } from '@tanstack/react-query'
import { getProduct, listProducts } from './products'
import { listTodos } from './todos'

// queryOptions: queryKey + queryFn 을 "한 번" 정의해 loader 프리페치와
// 컴포넌트 useSuspenseQuery 가 같은 것을 가리키게 한다(중복/불일치 방지).

export const productsQuery = queryOptions({
  queryKey: ['products'],
  queryFn: () => listProducts(),
})

// search 값(category)이 queryKey 에 들어간다 → 값이 바뀌면 다른 캐시 항목.
export function productsByCategoryQuery(category: string) {
  return queryOptions({
    queryKey: ['products', category],
    queryFn: async () => {
      const all = await listProducts()
      return category === 'all' ? all : all.filter((p) => p.category === category)
    },
  })
}

export const todosQuery = queryOptions({
  queryKey: ['todos'],
  queryFn: () => listTodos(),
})

// Chapter 08 종합용: 검색어+카테고리로 거른 카탈로그, 그리고 단일 상품.
export function catalogQuery(params: { q: string; category: string }) {
  return queryOptions({
    queryKey: ['catalog', params],
    queryFn: async () => {
      const all = await listProducts()
      return all.filter(
        (p) =>
          (params.category === 'all' || p.category === params.category) &&
          p.name.toLowerCase().includes(params.q.toLowerCase()),
      )
    },
  })
}

export function productQuery(id: string) {
  return queryOptions({
    queryKey: ['product', id],
    // React Query 는 undefined 반환을 금지한다 → 없으면 null 로 (notFound 는 loader 에서 처리)
    queryFn: async () => (await getProduct(id)) ?? null,
  })
}
