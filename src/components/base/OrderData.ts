import { IEvents } from "./events";
import { IOrderForm, IPayment } from "../../types";

export class OrderData {
  orderForm: IOrderForm;
  selectedItems: string[];
  paymentDetails: IPayment | null;

  constructor(data: { orderForm: IOrderForm; selectedItems: string[]; paymentDetails: IPayment | null; }, protected events: IEvents) {
      this.orderForm = data.orderForm;
      this.selectedItems = data.selectedItems;
      this.paymentDetails = data.paymentDetails;
  }

  emitChanges(event: string, payload?: object): void {
      this.events.emit(event, payload ?? {});
  }

  getOrderForm(): IOrderForm {
      return this.orderForm;
  }

  getSelectedItems(): string[] {
      return this.selectedItems;
  }

  setOrderForm(formData: IOrderForm): void {
      this.orderForm = formData;
  }

  selectItems(items: string[]): void {
      this.selectedItems = items;
  }

  setPaymentDetails(paymentInfo: IPayment): void {
      this.paymentDetails = paymentInfo;
  }
}