import { Module, OnModuleInit } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService]
})
export class SearchModule implements OnModuleInit {
    constructor(private readonly searchService: SearchService) {}

    async onModuleInit() {
        await this.searchService.setupIndex();
    }
}
