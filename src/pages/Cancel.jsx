import { useNavigate } from "react-router-dom";

const Cancel = () => {
  const navigate = useNavigate();
  return (
    <div className="order-success-wrapper">
      <div className="order-success-box">
        <div className="cancell-icon">❌</div>

        <h1>Payment Cancelled</h1>
        <p>Your payment was not completed.</p>

        <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate("/")}>Return to Home</button>
        </div>
      </div>
      <style>{`
.order-success-wrapper {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.order-success-box {
  max-width: 520px;
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  padding: 36px 32px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  animation: fadeScaleIn 0.35s ease;
}

/* Success icon */
.cancell-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #000;
  color: #ffffff;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Headings */
.order-success-box h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.order-success-box p {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* Buttons */
.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
}

.success-actions button {
  min-width: 160px;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.success-actions .btn-primary {
  background: #111827;
  color: #ffffff;
  border: none;
}

.success-actions .btn-primary:hover {
  background: #000000;
}

/* Animation */
@keyframes fadeScaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ===============================
   Mobile Responsive
================================ */

@media (max-width: 480px) {
  .order-success-box {
    padding: 28px 22px;
  }

  .success-actions {
    flex-direction: column;
  }

  .success-actions button {
    width: 100%;
  }
}
`}</style>
    </div>
  );
};

export default Cancel;