import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Breadcrumbs from '../../components/Breadcrumbs'
import Footer from '../../components/Footer'
import AllCards from '../../assets/images/All-Cards.png'
import BoltIcon from '../../assets/icons/Bolt-Icon.svg'
import QRCode from '../../assets/icons/QR-Code-Icon.svg'
import NFCIcon from '../../assets/icons/NFC-Icon.svg'
import TapIcon from '../../assets/icons/Tap-Icon.svg'
import SaveIcon from '../../assets/icons/Save-Icon.svg'
import HowItWorks1 from '../../assets/images/HowItWorks-1.png'
import HowItWorks2 from '../../assets/images/HowItWorks-2.png'
import HowItWorks3 from '../../assets/images/HowItWorks-3.png'
import ProfileIcon from '../../assets/icons/Profile-Icon.svg'
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg'
import PhoneIcon from '../../assets/icons/Phone-Icon.svg'
import NoApp from '../../assets/icons/NoApp-Icon.svg'
import ProfilePencil from '../../assets/icons/ProfilePencil-Icon.svg'
import ToolBoxIcon from '../../assets/icons/ToolBox-Icon.svg'
import UpdateIcon from '../../assets/icons/Update-Icon.svg'




export default function HowItWorks() {
    return (
        <>
            <Navbar />
            <div style={{ marginTop: 20 }} className="section-breadcrumbs">
                <Breadcrumbs />
            </div>
            <div style={{ marginTop: 40 }} className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h1 text-center">Your Digital Page to Win Work</h2>
                    <h3 className="desktop-h6 text-center">Share your contact details, show your best jobs, and earn trust — all in one simple link.</h3>
                </div>

                <div className="section-1-content">
                    <div className="section-1-left">
                        <img src={AllCards} className="" />
                    </div>

                    <div className="section-1-right">
                        <p className="desktop-h5">Look Pro. Build Trust. Get Hired.</p>
                        <p className="desktop-body">Show clients what you do and make it easy for them to call, message, or book you.</p>

                        <div className="section-list">
                            <div className="icon-white">
                                <img src={ProfilePencil} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Add Your Info</p>
                                <p className="desktop-body-xs">Put your name, trade, and photo on your page — make it personal and professional.</p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white">
                                <img src={ToolBoxIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Show Off Your Work</p>
                                <p className="desktop-body-xs">Upload job photos, add your services and pricing, and share reviews from happy customers.</p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white">
                                <img src={UpdateIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Update Anytime</p>
                                <p className="desktop-body-xs">New prices? New jobs? You can update your page anytime, no hassle.</p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white">
                                <img src={NFCIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Share It Fast</p>
                                <p className="desktop-body-xs">Tap a phone, scan a code, or send a link. Your page works anywhere — no apps needed.</p>
                            </div>
                        </div>

                        <div className="section-1-cta">
                            <Link to="/login" className="black-button desktop-button margin-top-10">Get Started Free</Link>
                        </div>
                    </div>
                </div>
            </div>


            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">How It Works</h2>
                    <h3 className="desktop-h6 text-center">
                        Set up your profile in minutes. Show off your work and win more jobs.
                    </h3>
                </div>

                <div className="how-it-works-container">
                    <div className="white-card-column">
                        <div className="how-it-works-info">
                            <img src={TapIcon} className="icon-40" />
                            <p className="desktop-h5">Build Your Page</p>
                            <p className="desktop-body">
                                Add your name, photos, services, and prices — no tech stuff needed.
                            </p>
                        </div>
                        <img src={HowItWorks1} className="white-card-column-image" />
                    </div>

                    <div className="how-it-works-right">
                        <div className="white-card">
                            <div className="how-it-works-info">
                                <img src={ProfileIcon} className="icon-40" />
                                <p className="desktop-h5">Share It Instantly</p>
                                <p className="desktop-body">
                                    Tap, scan, or send a link. Your full page opens in seconds.
                                </p>
                            </div>
                            <img src={HowItWorks2} className="how-it-works-right-image" />
                        </div>

                        <div className="white-card">
                            <div className="how-it-works-info">
                                <img src={SaveIcon} className="icon-40" />
                                <p className="desktop-h5">Win More Work</p>
                                <p className="desktop-body">
                                    Look pro, earn trust, and get booked faster with real reviews and a clean profile.
                                </p>
                            </div>
                            <img src={HowItWorks3} className="how-it-works-right-image" />
                        </div>
                    </div>
                </div>
            </div>





            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">Why Tradies Love Their Digital Page</h2>
                    <h3 className="desktop-h6 text-center">Show off your business with one tap.</h3>
                </div>

                <div className="section-3-container-flex">
                    <div className="section-3-container">
                        <div className="section-3-1x1-image-info">
                            <img src={QRCode} className="" />
                            <p className="desktop-h5 text-center">Your Info, Together</p>
                            <p className="desktop-body text-center">Services, reviews, prices — all easy to see.</p>
                        </div>
                        <div className="section-3-1x1-image-info">
                            <img src={QRCode} className="" />
                            <p className="desktop-h5 text-center">Look Like a Pro</p>
                            <p className="desktop-body text-center">Your page makes you look sharp and trusted.</p>
                        </div>
                    </div>
                    <div className="section-3-container">
                        <div className="section-3-1x1-image-info">
                            <img src={QRCode} className="" />
                            <p className="desktop-h5 text-center">Build Trust Fast</p>
                            <p className="desktop-body text-center">Show real reviews from happy customers.</p>
                        </div>
                        <div className="section-3-1x1-image-info">
                            <img src={QRCode} className="" />
                            <p className="desktop-h5 text-center">Easy to Update</p>
                            <p className="desktop-body text-center">Change prices or services any time.</p>
                        </div>
                    </div>
                </div>

                <div className="cta-center-text">
                    <p className="desktop-h6">Takes 5 minutes. No tech stuff needed.</p>
                    <Link to="/shopnfccards" className="black-button desktop-button">Get Started</Link>
                </div>
            </div>


            <Footer />
        </>
    )
}
