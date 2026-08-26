import { useEffect, useState } from "react";
import api from "../api/axios";
import ServiceCard from "../components/ServiceCard";

function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await api.get("/services");

        setServices(
          response.data.data ||
            response.data.services ||
            []
        );
      } catch (err) {
        console.log(err);

        setError(
          "We could not load laundry services right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  return (
    <main>
      <section className="hero-section">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              SMART LAUNDRY SERVICE
            </span>

            <h1>
              Laundry day,
              <span> handled.</span>
            </h1>

            <p>
              Choose a trusted laundry partner,
              schedule your pickup, and manage your
              order from one simple platform.
            </p>

            <div className="hero-actions">
              <a
                className="btn btn-primary btn-large"
                href="#services"
              >
                Browse Services
              </a>

              <div className="trust-copy">
                <strong>
                  Fast • Reliable • Simple
                </strong>

                <span>
                  Laundry care designed for busy city life
                </span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-badge">
              How it works
            </div>

            <div className="step-list">
              <div className="step-item">
                <span>1</span>

                <div>
                  <strong>
                    Choose a service
                  </strong>

                  <p>
                    Select washing, ironing,
                    or dry cleaning.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <span>2</span>

                <div>
                  <strong>
                    Schedule pickup
                  </strong>

                  <p>
                    Choose your preferred pickup window.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <span>3</span>

                <div>
                  <strong>
                    Track your order
                  </strong>

                  <p>
                    Follow your laundry until delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="section"
      >
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                AVAILABLE NOW
              </span>

              <h2>
                Laundry Services
              </h2>
            </div>

            <p>
              Choose a service from an approved
              Smart Laundry partner and place your
              order in minutes.
            </p>
          </div>

          {loading ? (
            <div className="state-card">
              Loading services...
            </div>
          ) : error ? (
            <div className="state-card error-state">
              {error}
            </div>
          ) : services.length === 0 ? (
            <div className="state-card">
              No services are currently available.
            </div>
          ) : (
            <div className="service-grid">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Home;