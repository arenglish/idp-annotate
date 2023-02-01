import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TissueClassViewerComponent } from './tissue-class-viewer.component';

describe('TissueClassViewerComponent', () => {
  let component: TissueClassViewerComponent;
  let fixture: ComponentFixture<TissueClassViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TissueClassViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TissueClassViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
