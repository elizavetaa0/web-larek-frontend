import { IEvents } from './events';
import { ICartItem, ICatalogueProduct } from '../../types';

export class CartData {
	items: ICartItem[];
	totalPrice: number;

	constructor(
		data: { items: ICartItem[]; totalPrice: number },
		protected events: IEvents
	) {
		this.items = data.items;
		this.totalPrice = data.totalPrice;
	}

	emitChanges(event: string, payload?: object): void {
		this.events.emit(event, payload ?? {});
	}

	getCartItems(): ICartItem[] {
		return this.items;
	}

	getTotalPrice(): number {
		return this.totalPrice;
	}

	addItemToCart(item: ICatalogueProduct): void {
		this.items.push({
			id: item.id,
			title: item.title,
			price: item.price,
			total: 0,
		});
		this.totalPrice += item.price;
	}

	removeItemFromCart(itemId: string): void {
		const itemIndex = this.items.findIndex((item) => item.id === itemId);
		if (itemIndex !== -1) {
			const removedItem = this.items.splice(itemIndex, 1)[0];
			this.totalPrice -= removedItem.price;
		}
	}
}
