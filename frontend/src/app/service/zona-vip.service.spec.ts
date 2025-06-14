import { TestBed } from '@angular/core/testing';

import { ZonaVipService } from './zona-vip.service';

describe('ZonaVipService', () => {
  let service: ZonaVipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZonaVipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
