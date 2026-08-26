import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Orders() {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/orders/customer/${user.id}`
        );

        setOrders(
          response.data.data ||
            response.data.orders ||
            []
        );
      } catch (err) {
        console.log(
          err.response?.data ||
            err.message
        );

        setError(
          "Could not load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user?.id]);

  if (!user) {
    return (
      <main className="page-shell">
        <div className="shell">
          <div className="state-card">
            <h2>
              Sign in to see your orders
            </h2>

            <p>
              You need a customer account
              to view your order history.
            </p>

            <Link
              className="btn btn-primary"
              to="/login"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              CUSTOMER ACCOUNT
            </span>

            <h1 className="page-title">
              My Orders
            </h1>
          </div>

          <p>
            Review your active and
            completed laundry orders.
          </p>
        </div>

        {loading ? (
          <div className="state-card">
            Loading orders...
          </div>
        ) : error ? (
          <div className="state-card error-state">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="state-card">
            <h2>No orders yet</h2>

            <p>
              Choose a laundry service
              to place your first order.
            </p>

            <Link
              className="btn btn-primary"
              to="/"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article
                key={order.id}
                className="order-card"
              >
                <div className="order-card-head">
                  <div>
                    <span className="eyebrow">
                      ORDER
                    </span>

                    <h3>
                      {order.order_number ||
                        `#${order.id.slice(0, 8)}`}
                    </h3>
                  </div>

                  <span
                    className={`status status-${String(
                      order.status
                    ).toLowerCase()}`}
                  >
                    {String(
                      order.status ||
                        "UNKNOWN"
                    ).replaceAll(
                      "_",
                      " "
                    )}
                  </span>
                </div>

                <div className="order-items">
                  {(order.order_items || []).map(
                    (item) => (
                      <div
                        key={item.id}
                        className="order-item-row"
                      >
                        <span>
                          {item.service_name_snapshot}{" "}
                          × {item.quantity}
                        </span>

                        <strong>
                          ৳
                          {Number(
                            item.line_total || 0
                          ).toFixed(0)}
                        </strong>
                      </div>
                    )
                  )}
                </div>

                <div className="order-card-foot">
                  <span>
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleString()
                      : "Date unavailable"}
                  </span>

                  <strong>
                    ৳
                    {Number(
                      order.total_amount || 0
                    ).toFixed(0)}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Orders;