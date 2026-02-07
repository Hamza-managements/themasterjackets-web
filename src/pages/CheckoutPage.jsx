import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Checkout from '../components/Checkout';
import { useCart } from '../context/CartContext';
import { createNewOrder } from '../utils/OrderUtils';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
const CheckoutPage = () => {
  const { cartItems, refreshCart } = useCart();

  const subtotal = cartItems?.items?.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async (orderData) => {
    try {
      const res = await createNewOrder(orderData);
      return res;
    } catch (error) {
      throw error;
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div>
        <Checkout
          cartItems={cartItems?.items || []}
          cartId={cartItems._id}
          totalPrice={subtotal || 0}
          onPlaceOrder={handlePlaceOrder}
          refreshCart={refreshCart}
        />
      </div>
    </Elements>
  );
};

export default CheckoutPage;