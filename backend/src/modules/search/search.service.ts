import { Injectable, Logger } from '@nestjs/common';
import meiliClient from '../../lib/meilisearch.client';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  async searchProducts(query: string, filters: any = {}) {
    try {
      const index = meiliClient.index('products');
      const searchParams: any = {
        limit: 20,
        attributesToHighlight: ['name', 'description'],
      };

      if (filters.category) {
        searchParams.filter = `categoryId = "${filters.category}"`;
      }
      
      // if (filters.priceMin && filters.priceMax) {
      //   searchParams.filter = `${searchParams.filter ? searchParams.filter + ' AND ' : ''}price >= ${filters.priceMin} AND price <= ${filters.priceMax}`;
      // }

      const result = await index.search(query, searchParams);
      return result;
    } catch (error) {
      this.logger.error('Meilisearch Error:', error);
      // Fallback or empty result
      return { hits: [], estimatedTotalHits: 0 };
    }
  }

  async setupIndex() {
      // Setup sortable/filterable attributes
      const index = meiliClient.index('products');
      await index.updateFilterableAttributes(['categoryId', 'brand', 'price', 'stockQuantity']);
      await index.updateSortableAttributes(['price', 'createdAt']);
      this.logger.log('Meilisearch index configured.');
  }
}
