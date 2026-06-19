import React from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const Index = () => {
  React.useEffect(() => {
    AOS.init({ offset: 0 });
  }, []);

  const hamburg = () => {
    console.log("Hamburger menu clicked");
  };

  return (
    <nav>
      <div className="nav-container">
        <div className="logo" data-aos="zoom-in" data-aos-duration="1500">
          Life <span>Connect</span>
        </div>
        <div className="links">
          <div className="link" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="100">
            <Link to="/">Home</Link>
          </div>
          <div className="link" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="200">
            <Link to="/about">About</Link>
          </div>
          <div className="link" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="300">
            <Link to="/donors">Donors</Link>
          </div>
          <div className="link" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="500">
            <Link to="/patients">Patient</Link>
          </div>
        </div>
        <i className="fa-solid fa-bars hamburg" onClick={hamburg}></i>
      </div>
    </nav>
  );
};

export default Index;
