import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarBotellaComponent } from './gestionar-botella.component';

describe('GestionarBotellaComponent', () => {
  let component: GestionarBotellaComponent;
  let fixture: ComponentFixture<GestionarBotellaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarBotellaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionarBotellaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
