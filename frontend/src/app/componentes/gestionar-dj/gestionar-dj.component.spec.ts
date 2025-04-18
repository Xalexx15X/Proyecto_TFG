import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarDjComponent } from './gestionar-dj.component';

describe('GestionarDjComponent', () => {
  let component: GestionarDjComponent;
  let fixture: ComponentFixture<GestionarDjComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarDjComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionarDjComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
