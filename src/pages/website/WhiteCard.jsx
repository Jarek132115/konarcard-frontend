import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Breadcrumbs from '../../components/Breadcrumbs'
import Footer from '../../components/Footer'
import KonarCard from '../../assets/images/KonarCard.png'
import KonarCardCustom from '../../assets/images/KonarCardCustom.png'
import AllCards from '../../assets/images/All-Cards.png'
import PremiumMaterials from '../../assets/icons/Premium-Materials-Icon.svg'
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg'
import QRCode from '../../assets/icons/QR-Code-Icon.svg'
import NFCIcon from '../../assets/icons/NFC-Icon.svg'
import PhoneIcon from '../../assets/icons/Phone-Icon.svg'
import NoApp from '../../assets/icons/NoApp-Icon.svg'
import NFCBusinessCard from '../../assets/images/NFC-Business-Card.jpg';
import ProductCover from '../../assets/images/Product-Cover.png';


export default function Home() {
    return (
        <>
            <Navbar />
            <div className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            {/* Main Product Section - RESTRUCTURED */}
            <div className="section-product">
                <div className="product-preview">
                    <img src={ProductCover} alt="Main Product Card" className="main-card" />
                </div>
                <div className="product-options">
                    <p className="desktop-h5">Konar Card - White Edition</p>
                    <p className="desktop-body">
                        The smart, durable card that instantly shows your profile — help customers see your work, your services, and how to contact you in seconds.
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 600, marginTop: 10, marginBottom: 20 }}>
                        £19.95
                    </p>

                    <div className="review-rating">
                        <img style={{ width: 120 }} src={ReviewStars} alt="Stars" />
                        <p>(22)</p>
                    </div>

                    <div className="option-group">
                        <Link to="/shopnfccards/whitecard" className="black-button" style={{ marginTop: 20 }}>
                            Buy Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section - KEPT AS IS */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className='desktop-h3 text-center'>Your Work. Your Card. Built to Impress.</h2>
                    <h3 className='desktop-h6 text-center'>Choose a smart, tough card that shows off your trade and makes sharing easy.</h3>
                </div>
                <div style={{ gap: 40 }} className="section-1-content">
                    <div className="section-1-left">
                        <img src={NFCBusinessCard} className="" />
                    </div>
                    <div className="section-1-right">
                        <p className='desktop-h5'>Why Tradies Choose Konar Cards</p>
                        <p className='desktop-body'>Smart, durable, and built to help you share your business in seconds.</p>
                        <div className="section-list">
                            <div className=" icon-white">
                                <img src={PremiumMaterials} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className='desktop-h6'>Built to Last</p>
                                <p className='desktop-body-xs'>Made from a durable, high-quality material that stands up to the demands of any job site.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className=" icon-white">
                                <img src={NFCIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className='desktop-h6'>Tap and Share</p>
                                <p className='desktop-body-xs'>There's a smart chip inside — tap it on most phones and your profile pops up.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className=" icon-white">
                                <img src={QRCode} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className='desktop-h6'>QR Code Backup</p>
                                <p className='desktop-body-xs'>No NFC? No problem. Every card comes with a scannable code too.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}