import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationViewOptionsComponent } from './annotation-view-options.component';

describe('AnnotationViewOptionsComponent', () => {
  let component: AnnotationViewOptionsComponent;
  let fixture: ComponentFixture<AnnotationViewOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationViewOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationViewOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
