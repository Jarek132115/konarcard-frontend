import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styling/home/customertrust.css";

// ✅ Use your new SVG files (original colour preserved via <img />)
import WorksOnEveryPhone from "../../assets/icons/WorksOnEveryPhone.svg";
import YourWorkAllInOnePlace from "../../assets/icons/YourWorkAllInOnePlace.svg";
import InstantContactOptions from "../../assets/icons/InstantContactOptions.svg";
import UpdateAnytime from "../../assets/icons/UpdateAnytime.svg";
import LooksProfessional from "../../assets/icons/LooksProfessional.svg";
import ShareAnywhere from "../../assets/icons/ShareAnywhere.svg";

export default function CustomerTrust() {
    const cards = useMemo(
        () => [
            {
                icon: WorksOnEveryPhone,
                alt: "Works on every phone icon",
                title: "Works on every phone",
                desc: "No apps. Just tap or scan.",
            },
            {
                icon: YourWorkAllInOnePlace,
                alt: "Your work all in one place icon",
                title: "Your work, all in one place",
                desc: "Photos, services, and reviews together.",
            },
            {
                icon: InstantContactOptions,
                alt: "Instant contact options icon",
                title: "Instant contact options",
                desc: "Call, message, or save details instantly.",
            },
            {
                icon: UpdateAnytime,
                alt: "Update anytime icon",
                title: "Update anytime",
                desc: "Change details without reprinting cards.",
            },
            {
                icon: LooksProfessional,
                alt: "Looks professional icon",
                title: "Looks professional",
                desc: "A clean profile that builds trust fast.",
            },
            {
                icon: ShareAnywhere,
                alt: "Share anywhere icon",
                title: "Share anywhere",
                desc: "Online, in person, or after the job.",
            },
        ],
        []
    );

    return (
        <section className="kht" aria-label="Trust builders for your digital business card">
            <div className="kht__inner">
                <header className="kht__head">
                    <h2 className="h3 kht__title">Everything Customers Need to Trust You</h2>
                    <p className="body-s kht__sub">
                        Your KonarCard digital business card puts your work, reviews, and contact details in one place — so
                        customers can see you’re legit and get in touch fast. Share contactless with an NFC tap, QR code, or link.
                    </p>
                </header>

                <div className="kht__grid" role="list" aria-label="Trust builder features">
                    {cards.map((c, i) => (
                        <article key={i} className="kht__card" role="listitem">
                            <img className="kht__icon" src={c.icon} alt={c.alt} loading="lazy" />
                            <h3 className="h6 kht__cardTitle">{c.title}</h3>
                            <p className="body-s kht__cardDesc">{c.desc}</p>
                        </article>
                    ))}
                </div>

                <div className="kht__cta">
                    <Link to="/examples" className="kht__btn kht__btn--primary">
                        See real profile examples
                    </Link>
                </div>
            </div>
        </section>
    );
}
