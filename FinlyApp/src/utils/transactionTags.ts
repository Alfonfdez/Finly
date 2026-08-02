export type TransactionTagLink = { transaction_id: number; tag_id: number; name: string };

export type TagsByTransaction = Map<number, { tag_id: number; name: string }[]>;

export function buildTagsByTransactionMap(tagLinks: TransactionTagLink[]): TagsByTransaction {
  const map: TagsByTransaction = new Map();
  for (const link of tagLinks) {
    const tags = map.get(link.transaction_id);
    if (tags) {
      tags.push({ tag_id: link.tag_id, name: link.name });
    } else {
      map.set(link.transaction_id, [{ tag_id: link.tag_id, name: link.name }]);
    }
  }
  return map;
}
