import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../api/axios";

function Order() {
  const location = useLocation();
  const navigate = useNavigate();

  const service =
    location.state?.service;

  const storedUser =
    JSON.parse(
      localStorage.getItem("user") ||
        "null"
    );

  const [quantity, setQuantity] =
    useState(1);

  const [addresses, setAddresses] =
    useState([]);

  const [
    pickupAddressId,
    setPickupAddressId,
  ] = useState("");

  const [
    pickupStart,
    setPickupStart,
  ] = useState("");

  const [
    pickupEnd,
    setPickupEnd,
  ] = useState("");

  const [
    customerNote,
    setCustomerNote,
  ] = useState("");

  const [
    loadingAddresses,
    setLoadingAddresses,
  ] = useState(true);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!storedUser?.id) {
        setLoadingAddresses(false);
        return;
      }

      try {
        const response =
          await api.get(
            `/addresses/${storedUser.id}`
          );

        const rows =
          response.data.data ||
          response.data.addresses ||
          [];

        setAddresses(rows);

        const defaultAddress =
          rows.find(
            (item) =>
              item.is_default
          ) || rows[0];

        if (defaultAddress) {
          setPickupAddressId(
            defaultAddress.id
          );
        }
      } catch (error) {
        console.log(
          error.response?.data ||
            error.message
        );
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [storedUser?.id]);

  const price =
    Number(
      service?.price ??
        service?.unit_price ??
        0
    );

  const total = useMemo(
    () => price * quantity,
    [price, quantity]
  );

  if (!service) {
    return (
      <main className="page-shell">
        <div className="shell">
          <div className="state-card">
            <h2>
              Service not found
            </h2>

            <p>
              Please choose a service again.
            </p>

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate("/")
              }
            >
              Back Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!storedUser) {
    return (
      <main className="page-shell">
        <div className="shell">
          <div className="state-card">
            <h2>
              Please sign in first
            </h2>

            <p>
              You need a customer account
              before placing an order.
            </p>

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate("/login")
              }
            >
              Sign In
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (!pickupAddressId) {
        alert(
          "Please select a pickup address."
        );

        return;
      }

      if (
        !pickupStart ||
        !pickupEnd
      ) {
        alert(
          "Please select pickup start and end time."
        );

        return;
      }

      if (
        new Date(pickupEnd) <=
        new Date(pickupStart)
      ) {
        alert(
          "Pickup end time must be later than pickup start time."
        );

        return;
      }

      try {
        setLoading(true);

        const orderData = {
          customer_id:
            storedUser.id,

          partner_id:
            service.provider.id,

          pickup_address_id:
            pickupAddressId,

          return_address_id:
            pickupAddressId,

          pickup_slot_start:
            new Date(
              pickupStart
            ).toISOString(),

          pickup_slot_end:
            new Date(
              pickupEnd
            ).toISOString(),

          items: [
            {
              service_id:
                service.id,

              service_name:
                service.name,

              unit_type:
                service.unitType ||
                service.unit_type ||
                "ITEM",

              quantity,

              unit_price:
                price,
            },
          ],

          customer_note:
            customerNote,
        };

        await api.post(
          "/orders",
          orderData
        );

        alert(
          "Order placed successfully!"
        );

        navigate("/orders");
      } catch (error) {
        console.log(
          error.response?.data ||
            error.message
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
    <main className="page-shell">
      <div className="shell order-layout">
        <section>
          <span className="eyebrow">
            CHECKOUT
          </span>

          <h1 className="page-title">
            Place your order
          </h1>

          <p className="page-subtitle">
            Confirm your quantity,
            pickup address, and pickup
            time.
          </p>

          <form
            className="checkout-card form-stack"
            onSubmit={handleSubmit}
          >
            <label>
              Quantity

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(
                      1,
                      Number(
                        e.target.value
                      ) || 1
                    )
                  )
                }
              />
            </label>

            <label>
              Pickup address

              <select
                value={pickupAddressId}
                onChange={(e) =>
                  setPickupAddressId(
                    e.target.value
                  )
                }
                disabled={
                  loadingAddresses ||
                  addresses.length === 0
                }
              >
                {loadingAddresses ? (
                  <option>
                    Loading addresses...
                  </option>
                ) : addresses.length ===
                  0 ? (
                  <option value="">
                    No saved address found
                  </option>
                ) : (
                  addresses.map(
                    (address) => (
                      <option
                        key={address.id}
                        value={address.id}
                      >
                        {[
                          address.address_line1,
                          address.address_line2,
                          address.area,
                          address.city,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </option>
                    )
                  )
                )}
              </select>
            </label>

            <label>
              Pickup start

              <input
                type="datetime-local"
                value={pickupStart}
                onChange={(e) =>
                  setPickupStart(
                    e.target.value
                  )
                }
                required
              />
            </label>

            <label>
              Pickup end

              <input
                type="datetime-local"
                value={pickupEnd}
                onChange={(e) =>
                  setPickupEnd(
                    e.target.value
                  )
                }
                required
              />
            </label>

            <label>
              Special instructions

              <textarea
                rows="4"
                placeholder="Example: Please handle white shirts carefully."
                value={customerNote}
                onChange={(e) =>
                  setCustomerNote(
                    e.target.value
                  )
                }
              />
            </label>

            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Placing order..."
                : "Place Order"}
            </button>
          </form>
        </section>

        <aside className="summary-card">
          <span className="eyebrow">
            ORDER SUMMARY
          </span>

          <h2>
            {service.name}
          </h2>

          <div className="summary-row">
            <span>
              Provider
            </span>

            <strong>
              {service.provider
                ?.businessName ||
                "Laundry Partner"}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Unit price
            </span>

            <strong>
              ৳{price.toFixed(0)}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Quantity
            </span>

            <strong>
              {quantity}
            </strong>
          </div>

          <div className="summary-total">
            <span>
              Total
            </span>

            <strong>
              ৳{total.toFixed(0)}
            </strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Order;