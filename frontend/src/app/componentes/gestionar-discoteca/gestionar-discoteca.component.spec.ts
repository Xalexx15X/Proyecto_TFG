import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarDiscotecaComponent } from './gestionar-discoteca.component';

describe('GestionarDiscotecaComponent', () => {
  let component: GestionarDiscotecaComponent;
  let fixture: ComponentFixture<GestionarDiscotecaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarDiscotecaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionarDiscotecaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
