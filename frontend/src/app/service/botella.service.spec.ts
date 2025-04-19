import { TestBed } from '@angular/core/testing';

import { BotellaService } from './botella.service';

describe('BotellaService', () => {
  let service: BotellaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BotellaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
