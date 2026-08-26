import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";

function Order() {
  const location = useLocation();
  const navigate = useNavigate();

  const service = location.state?.service;

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [quantity, setQuantity] = useState(1);

  const [pickupAddressId, setPickupAddressId] = useState(
    "33b5bd98-7ca3-4186-856b-1419362caa9e"
  );

  const [pickupStart, setPickupStart] = useState("");
  const [pickupEnd, setPickupEnd] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [loading, setLoading] = useState(false);

  if (!service) {
    return (
      <div>
        <h2>Service not found</h2>

        <button onClick={() => navigate("/")}>
          Back Home
        </button>
      </div>
    );
  }

  if (!storedUser) {
    return (
      <div>
        <h2>Please login before placing an order.</h2>

        <button onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    );
  }

  const total = service.price * quantity;

  const handleSubmit = async () => {
    if (!pickupStart || !pickupEnd) {
      alert("Please select pickup start and end time.");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        customer_id: storedUser.id,

        partner_id: service.provider.id,

        pickup_address_id: pickupAddressId,

        return_address_id: pickupAddressId,

        pickup_slot_start: new Date(pickupStart).toISOString(),

        pickup_slot_end: new Date(pickupEnd).toISOString(),

        items: [
          {
            service_id: service.id,
            service_name: service.name,
            unit_type: service.unitType,
            quantity: quantity,
            unit_price: service.price
          }
        ],

        customer_note: customerNote
      };

      const response = await api.post("/orders", orderData);

      console.log(response.data);

      alert("Order placed successfully!");

      navigate("/");

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Order creation failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>

      <h1>Place Order</h1>

      <h2>{service.name}</h2>

      <p>
        Provider: {service.provider.businessName}
      </p>

      <p>
        Price: {service.price} BDT per item
      </p>

      <div>
        <label>Quantity: </label>

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Math.max(1, Number(e.target.value))
            )
          }
        />
      </div>

      <br />

      <div>
        <label>Pickup Start: </label>

        <input
          type="datetime-local"
          value={pickupStart}
          onChange={(e) =>
            setPickupStart(e.target.value)
          }
        />
      </div>

      <br />

      <div>
        <label>Pickup End: </label>

        <input
          type="datetime-local"
          value={pickupEnd}
          onChange={(e) =>
            setPickupEnd(e.target.value)
          }
        />
      </div>

      <br />

      <div>
        <label>Special Note: </label>

        <input
          type="text"
          placeholder="Handle carefully"
          value={customerNote}
          onChange={(e) =>
            setCustomerNote(e.target.value)
          }
        />
      </div>

      <h3>
        Total: {total} BDT
      </h3>

      <button
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>

    </div>
  );
}

export default Order;