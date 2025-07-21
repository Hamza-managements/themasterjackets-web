import React from 'react';
import 'aos/dist/aos.css';
import './style.css'; // optional: if you have specific styles

export default function StatsSection() {
  const stats = [
    {
      icon: 'fa-users',
      title: '120,000+ Customers',
      description: 'Trusted by loyal fashion-forward customers worldwide.',
      delay: 500
    },
    {
      icon: 'fa-box',
      title: '150,000+ Orders',
      description: 'Delivered with premium care and quality assurance.',
      delay: 600
    },
    {
      icon: 'fa-star',
      title: '6,500+ 5-Star Reviews',
      description: 'Loved by real users for craftsmanship and durability.',
      delay: 900
    }
  ];

  return (
    <section className="section text-center bg-light" id="collections">
      <div className="container">
        <div className="row g-4">
          {stats.map((stat, index) => (
            <div
              className="col-md-4"
              data-aos="zoom-in"
              data-aos-delay={stat.delay}
              key={index}
            >
              <i className={`fa-solid ${stat.icon} feature-icon`}></i>
              <h4 className="mt-2">{stat.title}</h4>
              <p>{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
