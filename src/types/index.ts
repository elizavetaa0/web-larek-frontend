// описывает конкретный товар из массива. св-во description опционально, т.к появляется только при открытии подробной информации (модального окна)
export interface ICatalogueProduct {
	id: string;
	description?: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

// описывает способ оплаты и позволяет ввести адрес доставки
export interface IPayment {
	paymentMethod: string;
	deliveryAddress: string;
}

// описывает форму заказа с вводом данных о заказчике - почта и телефон
export interface IOrderForm {
	address?: string;
	email?: string;
	phone?: string;
}

// описывает заказ, добавляя к информации о заказчике массив идентификаторов заказа
export interface IOrder extends IOrderForm {
	items: string[];
	payment: string;
}

// тип для описания ошибок формы вводы
export type FormErrors = Partial<Record<keyof IOrderForm, string>>;

//описывает результат заказа с уникальным идентификатором
export interface IOrderResult {
	products: ICatalogueProduct[];
	totalAmount: number;
	address: string;
	paymentMethod: string;
	email: string;
	phone: string;
}

// тип для описания элемента корзины, содержащий информацию о товаре - id, title, price, а также отображающий общую сумму покупки

export type ICartItem = Pick<ICatalogueProduct, 'id' | 'title' | 'price'> & {
	total: number;
};

// интерфейс для описания состояния приложения
export interface IAppState {
	catalogue: ICatalogueProduct[];
	cart: string[];
	preview: string | null;
	order: IOrder | null;
	loading: boolean;
}
