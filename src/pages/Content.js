import React, { useState, useEffect, useMemo } from "react";
import bloodDonation from "./images/bloof.png";


const Content = () => {
  const texts = useMemo(() => ["Welcome!", "We connect lives.", "Donate & Save Lives"], []); // ✅ Fixed dependency issue

  const [text, setText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [delay, setDelay] = useState(100);
  const speed = 150;
  const eraseSpeed = 100;

  useEffect(() => {
    const handleTypewriter = () => {
      if (!isDeleting && charIndex < texts[textIndex].length) {
        setText(texts[textIndex].slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else if (!isDeleting) {
        setDelay(1000);
        setTimeout(() => setIsDeleting(true), delay);
      } else if (text.length > 0) {
        setText(texts[textIndex].slice(0, text.length - 1));
        setCharIndex((prev) => prev - 1);
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
        setCharIndex(0);
        setDelay(speed);
      }
    };

    const timer = setTimeout(handleTypewriter, isDeleting ? eraseSpeed : speed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, text, textIndex, delay, texts]); // ✅ Dependency fixed

  return (
    <section>
      <div className="main-container">
        <div className="image" data-aos="zoom-out" data-aos-duration="3000">
          <img src={bloodDonation} alt="Blood Donation" />
        </div>
        <div className="content">
          <div className="typewriter" data-aos="fade-right" data-aos-duration="1500" data-aos-delay="900">
            I'm a <span className="typewriter-text">{text}</span>|
          </div>
          <p data-aos="flip-down" data-aos-duration="1500" data-aos-delay="1100">
            <strong>Blood donors</strong> are lifesavers who selflessly give the gift of life by donating blood, helping patients in critical need. 
            <strong> Recipients</strong>—whether accident victims, surgical patients, or those battling illnesses—depend on these donations for survival. 
            Your donation can be the difference between life and death, bringing hope and healing to those in need.
          </p>
          <div className="btn" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="1800">
            <button>Login</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Content;
