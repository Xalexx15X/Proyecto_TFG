import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprarEntradaComponent } from './comprar-entrada.component';

describe('ComprarEntradaComponent', () => {
  let component: ComprarEntradaComponent;
  let fixture: ComponentFixture<ComprarEntradaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComprarEntradaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComprarEntradaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
