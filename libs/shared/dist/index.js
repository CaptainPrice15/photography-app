export const OPTIMIZABLE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"];
export function isOptimizable(format) {
    return OPTIMIZABLE_FORMATS.includes(format.toLowerCase());
}
