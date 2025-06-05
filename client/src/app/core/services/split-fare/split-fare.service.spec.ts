import { TestBed } from '@angular/core/testing';

import { SplitFareService } from './split-fare.service';

describe('SplitFareService', () => {
  let service: SplitFareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SplitFareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
