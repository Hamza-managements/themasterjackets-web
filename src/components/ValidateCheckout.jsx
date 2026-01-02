import { checkoutSchema } from "../utils/CheckoutSchema";

export const validateCheckout = async (formData, setErrors) => {
  try {
    await checkoutSchema.validate(formData, {
      abortEarly: false
    });

    setErrors({});
    return true;
  } catch (err) {
    const errors = {};
    err.inner.forEach(e => {
      errors[e.path] = e.message;
    });

    setErrors(errors);
    return false;
  }
};
