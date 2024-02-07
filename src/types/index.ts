
// описывает каталог с массивом объектов - товаров, которые получаем от сервера
export interface ICatalogue {
  total: number;
  items: ICatalogueProduct;
}

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
  email: string;
  phone: string;
}

// описывает заказ, добавляя к информации о заказчике массив идентификаторов заказа
export interface IOrder extends IOrderForm {
  items: string[];
}

// тип для описания ошибок формы вводы
export type FormErrors = Partial<Record<keyof IOrderForm, string>>;

//описывает результат заказа с уникальным идентификатором
export interface IOrderResult {
  id: string;
  total: number;
}

// тип для описания элемента корзины, содержащий информацию о товаре - id, title, price, а также отображающий общую сумму покупки

export type ICartItem = Pick<ICatalogueProduct, 'id' | 'title' | 'price'> & {
  total: number;
};




