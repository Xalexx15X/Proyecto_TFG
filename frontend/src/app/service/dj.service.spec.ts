import { TestBed } from '@angular/core/testing';

import { DjService } from './dj.service';

describe('DjService', () => {
  let service: DjService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DjService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
