import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') q: string,
    @Query('category') category?: string,
  ) {
    if (!q && !category) return { hits: [] };
    return this.searchService.searchProducts(q || '', { category });
  }
}
