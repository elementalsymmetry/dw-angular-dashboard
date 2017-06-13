import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSqlHelperComponent } from './order-sql-helper.component';

describe('OrderSqlHelperComponent', () => {
  let component: OrderSqlHelperComponent;
  let fixture: ComponentFixture<OrderSqlHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderSqlHelperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSqlHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
