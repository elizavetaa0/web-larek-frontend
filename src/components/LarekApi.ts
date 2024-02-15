import { Api, ApiListResponse } from './base/api';
import {  IOrder, IOrderResult, ICatalogueProduct } from "../types";

export interface ILarekAPI {
  getItemsList: () => Promise<ICatalogueProduct[]>;
  getItem:  (id: string) => Promise<ICatalogueProduct>;
  orderItems: (order: IOrder) =>  Promise<IOrderResult>;
}

export class LarekApi extends Api implements ILarekAPI {
  readonly cdn: string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getItem(id: string): Promise<ICatalogueProduct> {
    return this.get(`/product/${id}`).then(
        (item: any) => ({
            ...(item as ICatalogueProduct),
            image: this.cdn + item.image,
        })
    );
}

getItemsList(): Promise<ICatalogueProduct[]> {
  return this.get('/product').then((data: any) =>
          (data.items as ICatalogueProduct[]).map((item: any) => ({
              ...(item as ICatalogueProduct),
              image: this.cdn + item.image,
          }))
      );
}

orderItems(order: IOrder): Promise<IOrderResult> {
  console.log('Отправка данных на сервер:', order);
  return this.post('/order', order).then(
    (data: any) => data as IOrderResult
  );
}
}