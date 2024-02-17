import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard {
	title: string;
	image: string;
	category: string;
	description?: string;
	price: number | null;
}

export class Card extends Component<ICard> {
	protected _title: HTMLTextAreaElement;
	protected _image: HTMLImageElement;
	protected _category: HTMLTextAreaElement;
	protected _price: HTMLTextAreaElement;
	protected _actions: ICardActions | undefined;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);

		this._title = ensureElement<HTMLTextAreaElement>(
			`.${blockName}__title`,
			container
		);
		this._image = ensureElement<HTMLImageElement>(
			`.${blockName}__image`,
			container
		);
		this._category = ensureElement<HTMLTextAreaElement>(
			`.${blockName}__category`,
			container
		);
		this._price = ensureElement<HTMLTextAreaElement>(
			`.${blockName}__price`,
			container
		);
		this._actions = actions;

		container.addEventListener('click', this.handleClick.bind(this));
	}

	private handleClick(event: MouseEvent) {
		this._actions.onClick(event);
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set price(value: number | null) {
		this.setText(this._price, `${value} синапсов`);
	}

	set category(value: string) {
		this.setText(this._category, value);
	}
}
