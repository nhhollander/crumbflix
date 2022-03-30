import "./toast.scss";

type MessageClass = "debug" | "info" | "warning" | "error" | "success";

const DEFAULT_DURATION = 2000; // ms
const ANIM_DURATION = 500; // ms

export class Toast {

    private element:HTMLDivElement;
    private gone:boolean = false;

    constructor(class_:MessageClass, message:string) {
        this.element = document.createElement("div");
        this.element.classList.add("toast");
        this.element.classList.add(class_);
        this.element.innerText = message;
        document.body.appendChild(this.element);
    }

    /**
     * Hide and discard the message.
     *
     * Once this function has been called, the message is gone forever. Calling
     * this function again after destruction has no effect.
     */
    destroy() {
        if(this.gone) return;
        this.gone = true;
        this.element.classList.add("leaving");
        let e = this.element;
        setTimeout(() => document.body.removeChild(e), ANIM_DURATION);
    }

}

export function toast(class_:MessageClass, message:string, duration:number = DEFAULT_DURATION):Toast {
    console.log(`Toast: [${class_}][${duration}ms] ${message}`);
    let toast = new Toast(class_, message);
    if(duration > 0) {
        setTimeout(() => toast.destroy(), duration + ANIM_DURATION);
    }
    return toast;
}
