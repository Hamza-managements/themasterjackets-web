import Checkout from '../components/Checkout';
import { useCart } from '../context/CartContext';
import { createNewOrder } from '../utils/CartUtils';

const CheckoutPage = () => {
  const { cartItems } = useCart()

  const subtotal = cartItems?.items?.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async (orderData) => {
    console.log('Order Placed:', orderData);
    const res = await createNewOrder(orderData);
    console.log('Order creation response:', res);
    return res;
  };

  return (
    <div>
      <Checkout
        cartItems={cartItems?.items || []}
        totalPrice={subtotal || 0}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
};

export default CheckoutPage;
