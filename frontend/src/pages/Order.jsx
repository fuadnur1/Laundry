import {
  useCallback,
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

  const service = location.state?.service;

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [quantity, setQuantity] = useState(1);

  const [addresses, setAddresses] = useState([]);

  const [
    pickupAddressId,
    setPickupAddressId,
  ] = useState("");

  const [pickupStart, setPickupStart] =
    useState("");

  const [pickupEnd, setPickupEnd] =
    useState("");

  const [customerNote, setCustomerNote] =
    useState("");

  const [
    loadingAddresses,
    setLoadingAddresses,
  ] = useState(true);

  const [loading, setLoading] =
    useState(false);

  const [
    showAddressForm,
    setShowAddressForm,
  ] = useState(false);

  const [
    savingAddress,
    setSavingAddress,
  ] = useState(false);

  const [newAddress, setNewAddress] =
    useState({
      label: "Home",
      address_line: "",
      area: "",
      city: "Dhaka",
      postal_code: "",
      is_default: false,
    });

  // =========================================
  // LOAD SAVED ADDRESSES
  // =========================================

  const loadAddresses = useCallback(
    async (selectAddressId = null) => {
      if (!storedUser?.id) {
        setLoadingAddresses(false);
        return;
      }

      try {
        setLoadingAddresses(true);

        const response = await api.get(
          `/addresses/${storedUser.id}`
        );

        const rows =
          response.data.data ||
          response.data.addresses ||
          [];

        setAddresses(rows);

        if (selectAddressId) {
          setPickupAddressId(
            selectAddressId
          );
          return;
        }

        const defaultAddress =
          rows.find(
            (item) => item.is_default
          ) || rows[0];

        if (defaultAddress) {
          setPickupAddressId(
            defaultAddress.id
          );
        } else {
          setPickupAddressId("");
        }
      } catch (error) {
        console.log(
          error.response?.data ||
            error.message
        );
      } finally {
        setLoadingAddresses(false);
      }
    },
    [storedUser?.id]
  );

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // =========================================
  // PRICE
  // =========================================

  const price = Number(
    service?.price ??
      service?.unit_price ??
      0
  );

  const total = useMemo(
    () => price * quantity,
    [price, quantity]
  );

  // =========================================
  // NEW ADDRESS INPUT
  // =========================================

  const handleAddressChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setNewAddress((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================
  // SAVE NEW ADDRESS
  // =========================================

  const handleSaveAddress = async () => {
    if (!newAddress.address_line.trim()) {
      alert("Please enter your address.");
      return;
    }

    if (!newAddress.area.trim()) {
      alert("Please enter your area.");
      return;
    }

    if (!newAddress.city.trim()) {
      alert("Please enter your city.");
      return;
    }

    try {
      setSavingAddress(true);

      const response = await api.post(
        "/addresses",
        {
          user_id: storedUser.id,

          label:
            newAddress.label.trim(),

          address_line:
            newAddress.address_line.trim(),

          area:
            newAddress.area.trim(),

          city:
            newAddress.city.trim(),

          postal_code:
            newAddress.postal_code.trim(),

          is_default:
            newAddress.is_default,
        }
      );

      const createdAddress =
        response.data.data;

      setNewAddress({
        label: "Home",
        address_line: "",
        area: "",
        city: "Dhaka",
        postal_code: "",
        is_default: false,
      });

      setShowAddressForm(false);

      await loadAddresses(
        createdAddress?.id || null
      );

      alert(
        "Address saved successfully!"
      );
    } catch (error) {
      console.log(
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Could not save address."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  // =========================================
  // SERVICE CHECK
  // =========================================

  if (!service) {
    return (
      <main className="page-shell">
        <div className="shell">
          <div className="state-card">
            <h2>Service not found</h2>

            <p>
              Please choose a service again.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/")}
            >
              Back Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =========================================
  // LOGIN CHECK
  // =========================================

  if (!storedUser) {
    return (
      <main className="page-shell">
        <div className="shell">
          <div className="state-card">
            <h2>Please sign in first</h2>

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

  // =========================================
  // PLACE ORDER
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pickupAddressId) {
      alert(
        "Please select or add a pickup address."
      );
      return;
    }

    if (!pickupStart || !pickupEnd) {
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
        customer_id: storedUser.id,

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
            service_id: service.id,

            service_name:
              service.name,

            unit_type:
              service.unitType ||
              service.unit_type ||
              "ITEM",

            quantity,

            unit_price: price,
          },
        ],

        customer_note: customerNote,
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
            {/* QUANTITY */}

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

            {/* SAVED ADDRESS */}

            <div className="checkout-address-section">
              <label>
                Pickup address

                <select
                  value={
                    pickupAddressId
                  }
                  onChange={(e) =>
                    setPickupAddressId(
                      e.target.value
                    )
                  }
                  disabled={
                    loadingAddresses
                  }
                >
                  {loadingAddresses ? (
                    <option value="">
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
                          {address.is_default
                            ? "Default - "
                            : ""}

                          {address.label
                            ? `${address.label}: `
                            : ""}

                          {[
                            address.address_line,
                            address.area,
                            address.city,
                            address.postal_code,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </option>
                      )
                    )
                  )}
                </select>
              </label>

              <button
                type="button"
                className="add-address-button"
                onClick={() =>
                  setShowAddressForm(
                    (current) =>
                      !current
                  )
                }
              >
                {showAddressForm
                  ? "Cancel"
                  : "+ Add New Address"}
              </button>

              {/* NEW ADDRESS FORM */}

              {showAddressForm && (
                <div className="new-address-card">
                  <div className="new-address-heading">
                    <div>
                      <span className="eyebrow">
                        NEW ADDRESS
                      </span>

                      <h3>
                        Save a pickup address
                      </h3>
                    </div>
                  </div>

                  <div className="address-form-grid">
                    <label>
                      Label

                      <select
                        name="label"
                        value={
                          newAddress.label
                        }
                        onChange={
                          handleAddressChange
                        }
                      >
                        <option value="Home">
                          Home
                        </option>

                        <option value="Office">
                          Office
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </label>

                    <label className="address-full-width">
                      Full address *

                      <input
                        type="text"
                        name="address_line"
                        placeholder="Example: House 2, Road 1, C Block"
                        value={
                          newAddress.address_line
                        }
                        onChange={
                          handleAddressChange
                        }
                      />
                    </label>

                    <label>
                      Area *

                      <input
                        type="text"
                        name="area"
                        placeholder="Bashundhara R/A"
                        value={
                          newAddress.area
                        }
                        onChange={
                          handleAddressChange
                        }
                      />
                    </label>

                    <label>
                      City *

                      <input
                        type="text"
                        name="city"
                        placeholder="Dhaka"
                        value={
                          newAddress.city
                        }
                        onChange={
                          handleAddressChange
                        }
                      />
                    </label>

                    <label>
                      Postal code

                      <input
                        type="text"
                        name="postal_code"
                        placeholder="1229"
                        value={
                          newAddress.postal_code
                        }
                        onChange={
                          handleAddressChange
                        }
                      />
                    </label>
                  </div>

                  <label className="default-address-check">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={
                        newAddress.is_default
                      }
                      onChange={
                        handleAddressChange
                      }
                    />

                    <span>
                      Make this my default address
                    </span>
                  </label>

                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={
                      savingAddress
                    }
                    onClick={
                      handleSaveAddress
                    }
                  >
                    {savingAddress
                      ? "Saving..."
                      : "Save Address"}
                  </button>
                </div>
              )}
            </div>

            {/* PICKUP START */}

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

            {/* PICKUP END */}

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

            {/* SPECIAL INSTRUCTIONS */}

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

        {/* ORDER SUMMARY */}

        <aside className="summary-card">
          <span className="eyebrow">
            ORDER SUMMARY
          </span>

          <h2>{service.name}</h2>

          <div className="summary-row">
            <span>Provider</span>

            <strong>
              {service.provider
                ?.businessName ||
                "Laundry Partner"}
            </strong>
          </div>

          <div className="summary-row">
            <span>Unit price</span>

            <strong>
              ৳{price.toFixed(0)}
            </strong>
          </div>

          <div className="summary-row">
            <span>Quantity</span>

            <strong>{quantity}</strong>
          </div>

          <div className="summary-total">
            <span>Total</span>

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