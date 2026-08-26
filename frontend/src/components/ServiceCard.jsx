import { useNavigate } from "react-router-dom";

function ServiceCard({ service }) {
  const navigate = useNavigate();

  const handleOrder = () => {
    navigate(`/order/${service.id}`, {
      state: { service }
    });
  };

  return (
    <div
      style={{
        border: "1px solid #333",
        padding: "20px",
        margin: "20px",
        borderRadius: "12px"
      }}
    >
      <h2>{service.name}</h2>

      <p>Category: {service.category}</p>

      <h3>{service.price} BDT</h3>

      <p>
        Provider: {service.provider.businessName}
      </p>

      <button onClick={handleOrder}>
        Order Now
      </button>
    </div>
  );
}

export default ServiceCard;