import * as yup from "yup";

export const checkoutSchema = yup.object().shape({
    email: yup
        .string()
        .email("Invalid email address")
        .required("Email is required"),

    firstName: yup
        .string()
        .trim()
        .required("First name is required"),

    lastName: yup
        .string()
        .trim()
        .required("Last name is required"),

    addressLine1: yup
        .string()
        .trim()
        .required("Address is required"),

    addressLine2: yup
        .string()
        .trim()
        .nullable(),

    city: yup
        .string()
        .trim()
        .required("City is required"),
    phone: yup
        .string()
        .trim()
        .required("Phone is required"),

    country: yup
        .string()
        .trim()
        .required("Country is required"),

    zipCode: yup
        .string()
        .trim()
        .required("ZIP / Postal code is required"),
    termsAccepted: yup
        .boolean()
        .required("You must accept the terms and conditions")
        .oneOf([true], "Terms and conditions must be accepted"),

    paymentMethod: yup
        .string()
        .oneOf(["card", "stripe", "PAYPAL"])
        .required("Payment method is required"),

    /* ---------------- CARD FIELDS ---------------- */
    // cardNumber: yup.string().when("paymentMethod", {
    //     is: "CARD",
    //     then: () =>
    //         yup
    //             .string()
    //             .required("Card number is required")
    //             .matches(/^[0-9 ]+$/, "Invalid card number")
    //             .min(13, "Card number is too short")
    //             .max(19, "Card number is too long"),
    //     otherwise: () => yup.string().strip()
    // }),

    // cardName: yup.string().when("paymentMethod", {
    //     is: "CARD",
    //     then: () =>
    //         yup
    //             .string()
    //             .trim()
    //             .required("Name on card is required"),
    //     otherwise: () => yup.string().strip()
    // }),

    // expiryDate: yup.string().when("paymentMethod", {
    //     is: "CARD",
    //     then: () =>
    //         yup
    //             .string()
    //             .required("Expiry date is required")
    //             .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
    //     otherwise: () => yup.string().strip()
    // }),

    // cvv: yup.string().when("paymentMethod", {
    //     is: "CARD",
    //     then: () =>
    //         yup
    //             .string()
    //             .required("CVV is required")
    //             .matches(/^[0-9]{3,4}$/, "Invalid CVV"),
    //     otherwise: () => yup.string().strip()
    // })
});
