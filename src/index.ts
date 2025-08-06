// Controllers
export { BaseController } from './controllers/base.controller';
export { CustomerController } from './controllers/customer.controller';
export { OpportunityController } from './controllers/opportunity.controller';
// RecordController kaldırıldı

// Services
export { BaseService } from './services/base.service';
export { CustomerService } from './services/customer.service';
export { OpportunityService } from './services/opportunity.service';
// RecordService kaldırıldı

// Repositories
export { BaseRepository } from './repositories/base.repository';
export { CustomerRepository } from './repositories/customer.repository';
export { OpportunityRepository } from './repositories/opportunity.repository';
// RecordRepository kaldırıldı

// DTOs
export * from './dto/base.dto';
export * from './dto/customer.dto';
export * from './dto/opportunity.dto';
// record.dto kaldırıldı

// Middlewares
export * from './middlewares/error-handler.middleware';

// Utils
export { ResponseUtils } from './utils/response.utils';
export { ValidationUtils } from './utils/validation.utils';

// Constants
export * from './constants';

// Types for easier imports
export type {
  BaseResponse,
  PaginatedResponse,
  PaginationParams,
  ApiRequest,
  FilterParams,
  ValidationError,
  ValidationResult
} from './dto/base.dto';

export type {
  CustomerDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilterDto,
  CustomersResponse,
  CustomerSelectResponse
} from './dto/customer.dto';

export type {
  OpportunityDto,
  CreateOpportunityDto,
  CreateCalismaIzniDto,
  CreateIkametIzniDto,
  CreateDigerIslemDto,
  UpdateOpportunityDto,
  OpportunityFilterDto,
  OpportunitiesResponse,
  IslemTuruDto,
  FirsatDurumuDto,
  ParaBirimiDto,
  UcretDto,
  AciklamaDto,
  PdfDosyaDto
} from './dto/opportunity.dto';

// Record DTO'ları kaldırıldı - Record işlevselliği Opportunity'e entegre edildi