# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Описание проекта

При разработке проекта использовался паттерн **MVP**.

**Model** - отвечает за обработку данных и бизнес-логику, к ее функциям относятся методы по получению, обновлению и удалению данных.

**View** - отвечает за отображение данных или элементов интерефейса. К функциям можно отнести - отображение полученных с сервера данных, нажатие на кнопку или обработка нажатий кнопок, ввод текста, а также отправка запросов на сервер, валидация форм ввода.

**Presenter** - посредник между моделью и представлением. Он отвечает за обработку событий. В проекте представлен классом EventEmmitter.

Взаимодействие между частями архитектуры происходит следующим образом:

1. Представление отправляет запросы на получение данных или выполнение операций пользователю через презентера.  
2. Презентер обрабатывает запросы, взаимодействует с моделью для получения или обновления данных и передает их обратно представлению для отображения.  
3. При изменении данных в модели, презентер уведомляет представление об этом, чтобы оно могло обновить свое состояние.

Процессы в приложении реализованы с помощью **событийно-ориентированного подхода**, т.к вводится посредник - презентер для подписки на соверщаемые события и оповещения всех подписчиков об изменениях.

## Типы и интерфейсы

### ICatalogueProduct

Описывает конкретный товар из массива. св-во description опционально, т.к появляется только при открытии подробной информации (модального окна).

```
interface ICatalogueProduct {
  id: string;
  description?: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}
```

### IPayment

Описывает способ оплаты и позволяет ввести адрес доставки заказа.

```
interface IPayment {
  paymentMethod: string;
  deliveryAddress: string;
}
```

### IOrderForm

Описывает форму заказа с вводом данных о заказчике - почта и телефон.

```
interface IOrderForm {
  email: string;
  phone: string;
}
```

### IOrder

Интерфейс описывает заказ, добавляя к информации о заказчике массив идентификаторов заказа.

```
interface IOrder extends IOrderForm {
  items: string[];
}
```

### FormErrors

Данный тип позволяет описать ошибки формы ввода.

```
type FormErrors = Partial<Record<keyof IOrderForm, string>>;
```

### IOrderResult

Описывает результат заказа с уникальным идентификатором и суммой.

```
interface IOrderResult {
  id: string;
  total: number;
}
```

### ICartItem

Тип для описания элемента корзины, содержащий информацию о товаре - id, title, price, а также отображающий общую сумму покупки.

```
type ICartItem = Pick<ICatalogueProduct, 'id' | 'title' | 'price'> & {
  total: number;
};
```

### IAppState

Интерфейс для описания состояния приложения.
```
interface IAppState {
  catalogue: ICatalogueProduct[];
  cart: string[];
  preview: string | null;
  order: IOrder | null;
  loading: boolean;
}
```

## Базовые классы

### class EventEmitter implements IEvents

Представляет собой паттерн "Наблюдатель". Данный класс позволяет подписываться на события и сообщать подписчикам о наступлении события.

**Свойства:**

```
_events: Map<EventName, Set<Subscriber>>

constructor() {
  this._events = new Map<EventName, Set<Subscriber>>();
}
```

**Методы:**
- устанавливает обработчик на событие.
```
on<T extends object>(eventName: EventName, callback: (event: T) => void)
```
- снимает обработчик события.
```
off(eventName: EventName, callback: Subscriber) 
```
- инициироует событие с данными.
```
emit<T extends object>(eventName: string, data?: T) 
```
- слушает все события.
```
onAll(callback: (event: EmitterEvent) => void)
```
- сбрасывает все события.
```
offAll()
```
- делает коллбэк триггер, генерирующий все события.
```
trigger<T extends object>(eventName: string, context?: Partial<T>) 
```

### abstract class Component

Представляет собой низкоуровневое API для работы с HTML элементами.

**Свойства:**
```
protected constructor(protected readonly container: HTMLElement) {}
```
**Методы:**
- переключает класс.
```
toggleClass(element: HTMLElement, className: string, force?: boolean) 
```
- устанавливает текстовое содержимое.
```
protected setText(element: HTMLTextAreaElement, value: unknown) 
```
- изменяет статус блокировки.
```
setDisabled(element: HTMLButtonElement, state: boolean)
```
- скрывает элемент.
```
protected setHidden(element: HTMLElement)
```
- делает элемент видимым.
```
protected setVisible(element: HTMLElement) 
```
- устанавливает изображение.
```
protected setImage(element: HTMLImageElement, src: string, alt?: string) 
```
- возвращает корневой DOM-элемент.
```
render(data?: Partial<T>): HTMLElement 
```

### class Api

Данный класс используется для получения и отправки данных на сервер.

**Свойства:**
```
readonly baseUrl: string;
protected options: RequestInit;

constructor(baseUrl: string, options: RequestInit = {}) {
  this.baseUrl = baseUrl;
  this.options = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as object ?? {})
      }
  };
}
```
**Методы:**
- используется для обработки ответа от сервера после выполнения HTTP-запроса.
```
protected handleResponse(response: Response): Promise<object> 
```
- используется для получения данных от сервера.
```
get(uri: string) 
```
- используется для отправки данных на сервер.
```
post(uri: string, data: object, method: ApiPostMethods = 'POST')
```

## Компоненты модели данных (бизнес-логика)

### class LarekApi
Предоставляет методы для взаимодействия с внешним API.

**Свойства:**
```
readonly cdn: string;

constructor(cdn: string, baseUrl: string, options?: RequestInit) {
  super(baseUrl, options);
  this.cdn = cdn;
}
```
**Методы:**
- получает информацию о товаре по id.
```
getItem(id: string): Promise<ICatalogueProduct>;
```
- получает список всех товаров.
```
getItemsList(): Promise<ICatalogueProduct[]>;
```
- отправка заказа на сервер.
```
orderItems(order: IOrder): Promise<IOrderResult>;
```

### class CartData 

Хранить информацию о корзине пользователя и управляет товарами в корзине.

**Свойства:**
```
items: ICartItem[];
totalPrice: number;

constructor(data: { items: ICartItem[]; totalPrice: number; }, protected events: IEvents) {
  this.items = data.items;
  this.totalPrice = data.totalPrice;
}
```
**Методы:**
- отправка событий.
```
emitChanges(event: string, payload?: object): void;
```
- возвращает массив объектов, представляющих товары в корзине пользователя.
```
getCartItems(): ICartItem[];
```
- общую стоимость всех товаров в корзине пользователя. 
```
getTotalPrice(): number;
```
- добавляет товар в корзину.
```
addItemToCart(item: ICatalogueProduct): void;
```
- удаляет товар из корзины.
```
removeItemFromCart(itemId: string): void;
```

### class OrderData

Хранит информацию о заказе пользователя и управляет процессом оформления заказа.

**Свойства:**
```
orderForm: IOrderForm;
selectedItems: string[];
paymentDetails: IPayment | null;

constructor(data: { orderForm: IOrderForm; selectedItems: string[]; paymentDetails: IPayment | null; }, protected events: IEvents) {
  this.orderForm = data.orderForm;
  this.selectedItems = data.selectedItems;
  this.paymentDetails = data.paymentDetails;
}
```
**Методы:**
- отправка событий.
```
emitChanges(event: string, payload?: object): void;
```
- возвращает данные заказчика.
```
getOrderForm(): IOrderForm;
```
- возвращает массив идентификаторов выбранных товаров.
```
getSelectedItems(): string[];
```
- устанавливает данные заказчика.
```
setOrderForm(formData: IOrderForm): void;
```
- выбирает товары для заказа.
```
selectItems(items: string[]): void;
```
- устанавливает данные о способе оплаты и адресе доставки.
```
setPaymentDetails(paymentInfo: IPayment): void;
```

## Компоненты представления 

### class Page

Управляет отображением элементов интерфейса на странице.

**Свойства:**
```
protected _counter: HTMLTextAreaElement;
  protected _catalog: HTMLElement;
  protected _wrapper: HTMLElement;
  protected _basket: HTMLElement;


  constructor(container: HTMLElement, protected events: IEvents) {
      super(container);

      this._counter = ensureElement<HTMLTextAreaElement>('.header__basket-counter');
      this._catalog = ensureElement<HTMLElement>('.gallery');
      this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
      this._basket = ensureElement<HTMLElement>('.header__basket');

      this._basket.addEventListener('click', () => {
          this.events.emit('basket:open');
      });
  }
```

**Методы:**
- установка значения счетчика.
```
set counter(value: number);
```
- установка содержимого каталога продуктов.
```
set catalog(items: HTMLElement[]);
```
- установка блокировки страницы.
```
set locked(value: boolean);
```

### class Catalogue

Отображает каталог товаров.

**Свойства:**
```
catalogueData: ICatalogueProduct[];
onProductClick: (productId: string) => void;

constructor(catalogueData: ICatalogueProduct[], onProductClick: (productId: string) => void) {
  this.catalogueData = catalogueData;
  this.onProductClick = onProductClick;
}
```
**Методы:**
- отображение каталога.
```
render(): void;
```
- добавление товара в контейнер каталога.
```
catalogueContainer.appendChild(productElement);
```
### class Card

Отображает информацию о карточке товара.

**Свойства:**
```
protected _title: HTMLTextAreaElement;
protected _image: HTMLImageElement;
protected _category: HTMLElement;
protected _price: HTMLElement;
protected _actions: ICardActions | undefined;

constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
  super(container);

  this._title = ensureElement<HTMLTextAreaElement>(`.${blockName}__title`, container);
  this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
  this._category = ensureElement<HTMLElement>(`.${blockName}__category`, container);
  this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
  this._actions = actions;

  container.addEventListener('click', this.handleClick.bind(this));
}
```
**Методы:**
- обработка клика по карточке товара.
```
private handleClick(event: MouseEvent);
```
- сеттер установки id элемента DOM.
```
set id(value: string);
```
- геттер для получения id.
```
get id(): string;
```
- установка заголовка карточки.
```
set title(value: string);
```
- получение заголовка карточки.
```
get title(): string;
```
- установка изображения карточки.
```
set image(value: string);
```
- установка цены товара.
```
set price(value: number | null);
```
- установка категории товара.
```
set category(value: string);
```

### class Cart 

Отображает содержимое корзины.

**Свойства:**
```
protected _list: HTMLElement;
protected _total: HTMLSpanElement;
protected _button: HTMLButtonElement;
private _cartItems: ICartItem[] = [];

constructor(container: HTMLElement, protected events: EventEmitter) {
  super(container);

  this._list = ensureElement<HTMLElement>('.basket__list', this.container);
  this._total = this.container.querySelector('.basket__price') as HTMLSpanElement;
  this._button = this.container.querySelector('.basket__button');

  if (this._button) {
    this._button.addEventListener('click', () => {
      events.emit('order:open');
    });
  }

  this.items = [];
  this.renderCart();
  }
```
**Методы:**
- очищает содержимое корзины.
```
clearBasket();
```
- возвращает текущий список элементов корзины.
```
getCartItems()
```
- устанавливает отображаемые элементы корзины
```
set items(items: HTMLElement[]);
```
- устанавливает общую сумму заказа в корзине.
```
set total(total: number);
```
- проверяет, содержится ли элемент с заданным itemId в корзине.
```
isItemInCart(itemId: string): boolean;
```
- добавляет элемент в корзину.
```
addItem(item: ICartItem);
```
- удаляет элемент из корзины.
```
removeItem(itemId: string);
```
- отображает содержимое корзины на веб-странице.
```
renderCart();
```

### class OrderForm 

Форма ввода данных для оформления заказа. 

**Свойства:**
```
  button: HTMLButtonElement;
    address: string = ''; 
    selectedPaymentMethod: string = ''; 
    email: string = ''; 
    phone: string = ''; 

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this.button = container.querySelector('.order__button');
    
        const inputs = container.querySelectorAll<HTMLInputElement>('input[name="address"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.address = input.value;
                this.updateSubmitButtonState();
            });
        });
    
        const paymentButtons = container.querySelectorAll<HTMLButtonElement>('.order__buttons button');
        paymentButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const selectedMethod = button.name;
                this.selectedPaymentMethod = selectedMethod;
                this.updateSubmitButtonState();
                this.togglePaymentButtonStyles(selectedMethod); 
            });
        });
    }
```
**Методы:**
- применяет стили к кнопкам выбора метода оплаты.
```
togglePaymentButtonStyles(paymentMethod: string);
```
- геттер, возвращающий объект с данными формы заказа.
```
get formData();
```
- обновляет состояние кнопки отправки заказа.
```
updateSubmitButtonState();
```
- устанавливает состояние кнопки отправки заказа.
```
setButtonState(isValid: boolean);
```

### class Modal

Общий класс для модальных окон.

**Свойства:**
```
protected _closeButton: HTMLButtonElement;
protected _content: HTMLElement;

constructor(container: HTMLElement, protected events: IEvents) {
 super(container);

  this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
  this._content = ensureElement<HTMLElement>('.modal__content', container);

  this._closeButton.addEventListener('click', this.close.bind(this));
  this.container.addEventListener('click', this.close.bind(this));
  this._content.addEventListener('click', (event) => event.stopPropagation());
}
```
**Методы:**
- сеттер для установки нового значения в свойство content.
```
set content(value: HTMLElement);
```
- открывает модальное окно.
```
open();
```
- закрывает модальное окно.
```
close();
```
- отрисовывает модальное окно.
```
render(data: IModalData): HTMLElement;
```

### class Success

Отображает сообщение об успешном заказе и предоставляет возможность его закрыть.

**Свойства:**
```
protected _close: HTMLElement;

constructor(container: HTMLElement, actions: ISuccessActions) {
  super(container);

  this._close = ensureElement<HTMLElement>('.order-success__close', this.container);

  if (actions?.onClick) {
    this._close.addEventListener('click', actions.onClick);
    }
  }
```

### class Form

Отображает формы на странице и управляет отображением состояния форм.

**Свойства:**
```
protected _submit: HTMLButtonElement;

  constructor(protected container: HTMLFormElement, protected events: IEvents) {
    super(container);

    this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);

    this.container.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const field = target.name as keyof T;
      const value = target.value;
      this.onInputChange(field, value);
    });

    this.container.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      this.events.emit(`${this.container.name}:submit`);
      });
    }
```

**Методы:**
- обновление состояния формы и отправки соответствующего события.
```
protected onInputChange(field: keyof T, value: string);
```
- устанавливает состояние валидности формы.
```
set valid(value: boolean);
```
- отрисовка состояния формы.
```
render(state: Partial<T> & IFormState);
```
- получает контейнер.
```
getFormContainer(): HTMLFormElement;
```

### class AppState
Отвечает за управление и обработку данных в приложении.

**Свойства:**
```
  basket: string[];
  catalog: ProductItem[];
  loading: boolean;
  order: IOrder = {
      email: '',
      phone: '',
      items: [],
      payment: ''
  };

  preview: string | null;
  formErrors: FormErrors = {};
```
**Методы:**
- переключает состояние товара в заказе.
```
toggleOrderedItem(id: string, isIncluded: boolean);
```
- очищает корзину заказа, удаляя все товары из нее.
```
clearBasket();
```
- вычисляет общую стоимость товаров в заказе.
```
getTotal();
```
- устанавливает каталог товаров.
```
setCatalog(items: ICatalogueProduct[]);
```
- устанавливает предварительный просмотр.
```
setPreview(item: ProductItem);
```


## Основные события

1. **basket:open**:
   - Описание: Событие, которое сигнализирует о запросе открытия корзины.

2. **card:select**:
   - Описание: Событие, которое срабатывает при выборе карточки товара.

3. **order:open**:
   - Описание: Событие, вызываемое при открытии формы заказа.

4. **contacts:open**:
   - Описание: Событие, сигнализирующее о запросе открытия формы контактов для заказа.

5. **success:open**:
   - Описание: Событие, которое срабатывает при успешном оформлении заказа.

6. **order:submit**:
   - Описание: Событие, вызываемое при подтверждении оформления заказа.

7. **modal:open**:
   - Описание: Событие, срабатывающее при открытии модального окна.

8. **modal:close**:
   - Описание: Событие, вызываемое при закрытии модального окна.
