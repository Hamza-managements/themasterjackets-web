import { useEffect } from "react";

const Success = () => {
  useEffect(() => {
    // clear cart after success
    localStorage.removeItem("cart");
  }, []);

  return (
    <div className="text-center mt-5">
      <h1>🎉 Payment Successful!</h1>
      <p>Your order has been placed successfully.</p>
      <a href="/">Go to Home</a>
    </div>
  );
};

export default Success;