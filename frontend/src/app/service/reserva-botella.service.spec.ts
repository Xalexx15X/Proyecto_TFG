import { TestBed } from '@angular/core/testing';

import { ReservaBotellaService } from './reserva-botella.service';

describe('ReservaBotellaService', () => {
  let service: ReservaBotellaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservaBotellaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
