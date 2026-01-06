import Checkout from '../components/Checkout';
import { useCart } from '../context/CartContext';
import { createNewOrder } from '../utils/CartUtils';

const CheckoutPage = () => {
  const { cartItems, refreshCart } = useCart()

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
    <div>
      <Checkout
        cartItems={cartItems?.items || []}
        cartId={cartItems._id}
        totalPrice={subtotal || 0}
        onPlaceOrder={handlePlaceOrder}
        refreshCart={refreshCart}
      />
    </div>
  );
};

export default CheckoutPage;
