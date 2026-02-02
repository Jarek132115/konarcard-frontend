// src/components/Editor.jsx
import React, { useRef, useState, useEffect } from "react";
import { previewPlaceholders } from "../store/businessCardStore";
import useBusinessCardStore from "../store/businessCardStore";

/* icons */
import FacebookIcon from "../assets/icons/icons8-facebook.svg";
import InstagramIcon from "../assets/icons/icons8-instagram.svg";
import LinkedInIcon from "../assets/icons/icons8-linkedin.svg";
import XIcon from "../assets/icons/icons8-x.svg";
import TikTokIcon from "../assets/icons/icons8-tiktok.svg";

/* color wheel */
import iro from "@jaames/iro";

/* contrast helper */
const getContrastColor = (hex = "#000000") => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return "#111";
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  const L = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  return L > 0.6 ? "#111" : "#fff";
};

export default function Editor({
  state,
  updateState,
  onSubmit,
  onStartSubscription,
  onCoverUpload,
  onRemoveCover,
  onAvatarUpload,
  onRemoveAvatar,
  onAddWorkImages,
  onRemoveWorkImage,
}) {
  const {
    checkLimit,
    lockTemplateIfNeeded,
  } = useBusinessCardStore();

  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const workInputRef = useRef(null);

  /* color wheel */
  const [wheelOpen, setWheelOpen] = useState(false);
  const wheelMountRef = useRef(null);

  useEffect(() => {
    if (!wheelOpen || !wheelMountRef.current) return;
    wheelMountRef.current.innerHTML = "";

    const picker = new iro.ColorPicker(wheelMountRef.current, {
      width: 200,
      color: state.buttonBgColor,
      layout: [{ component: iro.ui.Wheel }],
    });

    picker.on("color:change", (c) =>
      updateState({ buttonBgColor: c.hexString })
    );
  }, [wheelOpen]);

  const pickedBg = state.buttonBgColor;
  const pickedInk = getContrastColor(pickedBg);

  /* =========================
     TEMPLATE SELECT
  ========================= */
  const handleTemplateSelect = (id) => {
    const ok = lockTemplateIfNeeded(id);
    if (!ok) onStartSubscription?.();
  };

  /* =========================
     WORK IMAGES
  ========================= */
  const handleAddImages = (files) => {
    if (!checkLimit("images")) {
      onStartSubscription?.();
      return;
    }
    onAddWorkImages(files);
  };

  /* =========================
     SERVICES
  ========================= */
  const addService = () => {
    if (!checkLimit("services")) {
      onStartSubscription?.();
      return;
    }
    updateState({
      services: [...state.services, { name: "", price: "" }],
    });
  };

  /* =========================
     REVIEWS
  ========================= */
  const addReview = () => {
    if (!checkLimit("reviews")) {
      onStartSubscription?.();
      return;
    }
    updateState({
      reviews: [...state.reviews, { name: "", text: "", rating: 5 }],
    });
  };

  return (
    <form className="myprofile-editor" onSubmit={onSubmit}>
      {/* TEMPLATE SELECT */}
      <h3>Template</h3>
      <div className="template-row">
        {["template-1", "template-2", "template-3", "template-4", "template-5"].map((t) => (
          <button
            key={t}
            type="button"
            className={`template-chip ${state.template_id === t ? "active" : ""}`}
            style={{
              background:
                t === "template-1"
                  ? "#e74c3c"
                  : t === "template-2"
                    ? "#3498db"
                    : t === "template-3"
                      ? "#2ecc71"
                      : t === "template-4"
                        ? "#f1c40f"
                        : "#9b59b6",
            }}
            onClick={() => handleTemplateSelect(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* BUTTON STYLE */}
      <h3>Button Style</h3>
      <div
        className="color-chip"
        style={{ background: pickedBg, color: pickedInk }}
        onClick={() => setWheelOpen(!wheelOpen)}
      >
        Pick colour
      </div>
      {wheelOpen && <div ref={wheelMountRef} />}

      {/* COVER */}
      <h3>Cover Photo</h3>
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => e.target.files && onCoverUpload(e.target.files[0])}
      />
      <button type="button" onClick={() => coverInputRef.current.click()}>
        Upload cover
      </button>

      {/* WORK */}
      <h3>Work Images</h3>
      <div className="work-grid">
        {state.workImages.map((img, i) => (
          <div key={i} className="img-tile">
            <img src={img.preview || img} alt="" />
            <button type="button" onClick={() => onRemoveWorkImage(i)}>
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={() => workInputRef.current.click()}>
          + Add
        </button>
      </div>
      <input
        ref={workInputRef}
        type="file"
        multiple
        hidden
        accept="image/*"
        onChange={(e) => handleAddImages(Array.from(e.target.files || []))}
      />

      {/* SERVICES */}
      <h3>Services</h3>
      {state.services.map((s, i) => (
        <div key={i}>
          <input
            value={s.name}
            onChange={(e) => {
              const next = [...state.services];
              next[i].name = e.target.value;
              updateState({ services: next });
            }}
            placeholder="Service name"
          />
          <input
            value={s.price}
            onChange={(e) => {
              const next = [...state.services];
              next[i].price = e.target.value;
              updateState({ services: next });
            }}
            placeholder="Price"
          />
        </div>
      ))}
      <button type="button" onClick={addService}>
        + Add service
      </button>

      {/* REVIEWS */}
      <h3>Reviews</h3>
      {state.reviews.map((r, i) => (
        <div key={i}>
          <input
            value={r.name}
            onChange={(e) => {
              const next = [...state.reviews];
              next[i].name = e.target.value;
              updateState({ reviews: next });
            }}
            placeholder="Name"
          />
          <textarea
            value={r.text}
            onChange={(e) => {
              const next = [...state.reviews];
              next[i].text = e.target.value;
              updateState({ reviews: next });
            }}
            placeholder="Review"
          />
        </div>
      ))}
      <button type="button" onClick={addReview}>
        + Add review
      </button>

      {/* SUBMIT */}
      <button type="submit" className="publish-btn">
        Publish
      </button>

      {/* UPGRADE MODAL TRIGGER */}
      {state.upgradeRequired && (
        <div className="upgrade-banner">
          <p>{state.upgradeReason}</p>
          <button type="button" onClick={onStartSubscription}>
            Upgrade
          </button>
        </div>
      )}
    </form>
  );
}
