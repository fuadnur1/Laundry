import { useNavigate } from "react-router-dom";

function ServiceCard({ service }) {
  const navigate = useNavigate();

  const providerName =
    service?.provider?.businessName ||
    service?.provider?.business_name ||
    "Laundry Partner";

  const unitType =
    service?.unitType ||
    service?.unit_type ||
    "ITEM";

  const price =
    Number(
      service?.price ??
        service?.unit_price ??
        0
    );

  const estimatedHours =
    service?.estimatedHours ||
    service?.estimated_hours ||
    24;

  const handleOrder = () => {
    navigate(
      `/order/${service.id}`,
      {
        state: {
          service,
        },
      }
    );
  };

  return (
    <article className="service-card">
      {/* TOP */}

      <div className="service-card-top">
        <div className="service-icon">
          ✦
        </div>

        <div className="pill">
          {service.category ||
            "Laundry"}
        </div>
      </div>

      {/* SERVICE */}

      <h3>
        {service.name}
      </h3>

      <p className="service-description">
        {service.description ||
          "Professional laundry care with convenient pickup and delivery."}
      </p>

      {/* META */}

      <div className="service-meta">
        <div>
          <span>
            Provider
          </span>

          <strong>
            {providerName}
          </strong>
        </div>

        <div>
          <span>
            Turnaround
          </span>

          <strong>
            {estimatedHours} hrs
          </strong>
        </div>
      </div>

      {/* PRICE */}

      <div className="service-footer">
        <div>
          <span className="price-label">
            Starting from
          </span>

          <div className="price">
            ৳{price.toFixed(0)}

            <small>
              {" "}
              /{" "}
              {String(
                unitType
              ).toLowerCase()}
            </small>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleOrder}
        >
          Order Now
        </button>
      </div>
    </article>
  );
}

export default ServiceCard;