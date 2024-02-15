import { Form } from "./base/Form";
import { IOrderForm } from "../types";
import { IEvents } from "./base/events";

export class OrderForm extends Form<IOrderForm> {
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

    togglePaymentButtonStyles(paymentMethod: string) {
        const paymentButtons = this.container.querySelectorAll<HTMLButtonElement>('.order__buttons button');
        paymentButtons.forEach(button => {
            if (button.name === paymentMethod) {
                button.classList.add('button_alt-active');
            } else {
                button.classList.remove('button_alt-active');
            }
        });
    }

    get formData() {
        return {
            paymentMethod: this.selectedPaymentMethod,
            deliveryAddress: this.address,
            email: this.email,
            phone: this.phone
        };
    }

    updateSubmitButtonState() {
        const isAddressFilled = this.address.trim() !== '';
        const isPaymentSelected = !!this.selectedPaymentMethod;
        this.setButtonState(isAddressFilled && isPaymentSelected);
    }

    setButtonState(isValid: boolean) {
        this.button.disabled = !isValid;
    }
}
