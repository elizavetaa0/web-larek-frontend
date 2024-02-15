import { IEvents } from "./events";
import { ICatalogueProduct } from "../../types";

export class CatalogueData {
  items: ICatalogueProduct[];
  total: number;
  selectedItem: ICatalogueProduct | null;

  constructor(data: { items: ICatalogueProduct[]; total: number; selectedItem: ICatalogueProduct | null; }, protected events: IEvents) {
    this.items = data.items;
    this.total = data.total;
    this.selectedItem = data.selectedItem;
}
  emitChanges(event: string, payload?: object): void {
    this.events.emit(event, payload ?? {});
  }

  getCatalogueItems(): ICatalogueProduct[] {
    return this.items;
  }

  getTotalItemsCount(): number {
    return this.total;
  }

  selectItem(itemId: string): void {
    this.selectedItem = this.items.find(item => item.id === itemId) || null;
  }
}