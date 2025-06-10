import React from "react";

export const EditBio = () => {
  return (
    <div className="profile-card">
      <div className="card-header">
        <h2 className="header-title">About Me</h2>
      </div>

      <div className="card-content">
        <div className="profile-section">
          <div className="image-container">
            <div className="profile-image">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                alt="Profile"
              />
            </div>
            <p className="cover-photo-label">Cover Photo</p>
          </div>

          <div className="form-fields">
            <div className="field">
              <label className="field-label">Full Name</label>
              <input className="field-value" />
            </div>

            <div className="field">
              <label className="field-label">Job Title</label>
              <input className="field-value" />
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="about-label">About Me</div>
          <textarea
            className="field-value"
            value="I am a young talented web design based out in London who loves what
            he does and is one of the best in"
          />
        </div>
      </div>
    </div>
  );
};
