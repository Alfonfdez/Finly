export type TransactionTagLink = { transaction_id: number; tag_id: number; name: string };

export type TagsByTransaction = Map<number, { tag_id: number; name: string }[]>;

export function buildTagsByTransactionMap(tagLinks: TransactionTagLink[]): TagsByTransaction {
  const map: TagsByTransaction = new Map();
  for (const link of tagLinks) {
    if (!map.has(link.transaction_id)) map.set(link.transaction_id, []);
    map.get(link.transaction_id)!.push({ tag_id: link.tag_id, name: link.name });
  }
  return map;
}
