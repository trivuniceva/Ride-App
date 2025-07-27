import { TestBed } from '@angular/core/testing';

import { RideRatingService } from './ride-rating.service';

describe('RideRatingService', () => {
  let service: RideRatingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RideRatingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
