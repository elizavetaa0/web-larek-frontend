import { Component } from "../base/Component";
import { cloneTemplate, createElement, ensureElement } from "../../utils/utils";
import { EventEmitter } from "../base/events";

interface ICartView {
  items: HTMLElement[];
  total: number;
}

interface ICartItem {
  id: string;
  title: string;
  price: number | null;
}

export class Cart extends Component<ICartView> {
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

  clearBasket() {
    this._cartItems = [];
    this.renderCart();
    this.events.emit('cart:cleared', this._cartItems);
  }

  getCartItems() {
    return this._cartItems;
  }
  
  set items(items: HTMLElement[]) {
    this._list.innerHTML = '';

    if (items.length) {
      items.forEach(item => {
        this._list.appendChild(item);
      });
    } else {
      const messageParagraph = createElement<HTMLParagraphElement>('p', {
        textContent: 'Тут пока ничего нет'
      });
      this._list.appendChild(messageParagraph);
    }
  }

  isItemInCart(itemId: string): boolean {
    return this._cartItems.some(item => item.id === itemId);
  }

  set total(total: number) {
    this._total.innerText = total.toString();
  }

  addItem(item: ICartItem) {
    this._cartItems.push({ id: item.id, title: item.title, price: item.price || 0 });

    this.renderCart();
    this.events.emit('basket:open');

    const total = this._cartItems.reduce((acc, item) => acc + (item.price || 0), 0);
    this._total.innerText = total.toString();

  }

  removeItem(itemId: string) {
    const index = this._cartItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this._cartItems.splice(index, 1);
      this.renderCart();
      this.events.emit('basket:open');
    }
  }

  renderCart() {
    this._list.innerHTML = '';
  
    if (this._cartItems.length === 0) {
      this._button.disabled = true;
      return;
    } else {
      this._button.disabled = false;
    }
  
    this._cartItems.forEach((item, index) => {
      const basketItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
      const basketItemContent = basketItemTemplate.content.cloneNode(true) as HTMLElement;
  
      const indexElement = basketItemContent.querySelector('.basket__item-index') as HTMLElement;
      const titleElement = basketItemContent.querySelector('.card__title') as HTMLElement;
      const priceElement = basketItemContent.querySelector('.card__price') as HTMLElement;
      const deleteButton = basketItemContent.querySelector('.basket__item-delete') as HTMLButtonElement;
  
      indexElement.textContent = (index + 1).toString();
      titleElement.textContent = item.title;
      priceElement.textContent = `${item.price} синапсов`;
  
      deleteButton.addEventListener('click', () => {
        this.removeItem(item.id);
      });
  
      this._list.appendChild(basketItemContent);
    });
  
    const total = this._cartItems.reduce((acc, item) => acc + (item.price || 0), 0);
    this.events.emit('basket:open');
  }
}