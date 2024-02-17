import { Api, ApiListResponse } from './base/api';
import { IOrder, IOrderResult, ICatalogueProduct } from '../types';

export interface ILarekAPI {
	getItemsList: () => Promise<ICatalogueProduct[]>;
	getItem: (id: string) => Promise<ICatalogueProduct>;
	orderItems: (order: IOrder) => Promise<IOrderResult>;
}

export class LarekApi extends Api implements ILarekAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getItem(id: string): Promise<ICatalogueProduct> {
		return this.get(`/product/${id}`).then((item: ICatalogueProduct) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	getItemsList(): Promise<ICatalogueProduct[]> {
		return this.get('/product').then(
			(data: ApiListResponse<ICatalogueProduct>) =>
				data.items.map((item) => ({
					...item,
					image: this.cdn + item.image,
				}))
		);
	}

	orderItems(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then((data: IOrderResult) => data);
	}
}
