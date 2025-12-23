import meiliClient from '../../lib/meilisearch.client';

export async function indexProductToMeili(product: any) {
  try {
    const index = meiliClient.index('products');
    // Flatten product for search (customize as needed)
    const doc = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      categoryId: product.categoryId,
      description: product.catalog?.description,
      shortDescription: product.catalog?.shortDescription,
      images: product.catalog?.images,
      videos: product.catalog?.videos,
      specifications: product.catalog?.specifications,
      variants: product.catalog?.variants,
      seo: product.catalog?.seo,
      searchKeywords: product.catalog?.searchKeywords,
      price: product.price,
      stockQuantity: product.stockQuantity,
    };
    const res = await index.addDocuments([doc]);
    console.log('[Meili] addDocuments response:', res);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Meili] Failed to index product', err);
  }
}

export async function removeProductFromMeili(productId: string) {
  try {
    const index = meiliClient.index('products');
    await index.deleteDocument(productId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Meili] Failed to remove product', err);
  }
}
