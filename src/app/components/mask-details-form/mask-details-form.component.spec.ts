import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaskDetailsFormComponent } from './mask-details-form.component';

describe('MaskDetailsFormComponent', () => {
  let component: MaskDetailsFormComponent;
  let fixture: ComponentFixture<MaskDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaskDetailsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaskDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
