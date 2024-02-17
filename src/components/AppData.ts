import _ from 'lodash';

import { Model } from './base/Model';
import {
	IAppState,
	FormErrors,
	IOrder,
	ICatalogueProduct,
	ICartItem,
} from '../types';
import { Cart } from './base/Cart';

export type CatalogChangeEvent = {
	catalog: ProductItem[];
};

export class ProductItem extends Model<ICatalogueProduct> {
	id: string;
	category: string;
	title: string;
	description: string;
	image: string;
	price: number | null;
	total: number;

	addToCart(cart: Cart) {
		const newItem: ICartItem = {
			id: this.id,
			title: this.title,
			price: this.price,
			total: this.total,
		};

		cart.addItem(newItem);
	}
}

export class AppState extends Model<IAppState> {
	basket: string[];
	catalog: ProductItem[];
	loading: boolean;
	order: IOrder = {
		email: '',
		phone: '',
		items: [],
		payment: '',
	};

	preview: string | null;
	formErrors: FormErrors = {};

	toggleOrderedItem(id: string, isIncluded: boolean) {
		if (isIncluded) {
			this.order.items = _.uniq([...this.order.items, id]);
		} else {
			this.order.items = _.without(this.order.items, id);
		}
	}

	clearBasket() {
		this.order.items.forEach((id) => {
			this.toggleOrderedItem(id, false);
		});
	}

	getTotal() {
		return this.order.items.reduce((total, itemId) => {
			const product = this.catalog.find((item) => item.id === itemId);
			if (product) {
				return total + (product.price || 0);
			} else {
				return total;
			}
		}, 0);
	}

	setCatalog(items: ICatalogueProduct[]) {
		this.catalog = items.map((item) => new ProductItem(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setPreview(item: ProductItem) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}
}
