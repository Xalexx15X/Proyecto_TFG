import { TestBed } from '@angular/core/testing';

import { DiscotecaService } from './discoteca.service';

describe('DiscotecaService', () => {
  let service: DiscotecaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscotecaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
