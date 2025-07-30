import { TestBed } from '@angular/core/testing';

import { RideReorderServiceService } from './ride-reorder-service.service';

describe('RideReorderServiceService', () => {
  let service: RideReorderServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RideReorderServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
