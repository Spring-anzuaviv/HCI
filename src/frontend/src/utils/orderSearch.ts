import type { Order, OrderFilter } from '../types';

export function filterOrders(orders: Order[], search: string, filter: OrderFilter) {
  const query = search.trim().toLowerCase();
  const compactQuery = query.replace(/[\s-]/g, '').replace(/^#/, '');
  return orders.filter(order => {
    const matchesSearch = !query || order.name.toLowerCase().includes(query)
      || order.phone.toLowerCase().replace(/[\s-]/g, '').includes(compactQuery)
      || order.id.toLowerCase() === compactQuery;
    return matchesSearch && (filter === 'all' || order.status === filter);
  });
}
