import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleDiscotecaComponent } from './detalle-discoteca.component';

describe('DetalleDiscotecaComponent', () => {
  let component: DetalleDiscotecaComponent;
  let fixture: ComponentFixture<DetalleDiscotecaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleDiscotecaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetalleDiscotecaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
