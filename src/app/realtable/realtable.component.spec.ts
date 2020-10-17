import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtableComponent } from './realtable.component';

describe('RealtableComponent', () => {
  let component: RealtableComponent;
  let fixture: ComponentFixture<RealtableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealtableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealtableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
