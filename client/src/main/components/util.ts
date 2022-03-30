/**
 * Sleep for a specified number of milliseconds.
 */
export function sleep(ms:number):Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Round a floating point to the nearest decimal place specified
 */
export function round_float(num:number, precision:number):number {
    let pow = 10 ** precision;
    let raised = Math.round(num * pow);
    return raised / pow;
}

/**
 * Number bounds
 */
export function bounds(num:number, min:number, max:number) {
    return Math.min(Math.max(num, min), max);
}