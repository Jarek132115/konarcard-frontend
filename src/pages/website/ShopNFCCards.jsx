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




export default function
    () {
    return (
        <>
            <Navbar />
            <div className="section-breadcrumbs">
                <Breadcrumbs />
            </div>
            <div className="section">
                <div className="section-1-title">
                    <h2 className='desktop-h1 text-center'>Choose Your Perfect Card</h2>
                    <h3 className='desktop-h6 text-center'>Premium materials. Custom designs. Instantly share your contact details with a single tap.</h3>
                </div>
                <div className="section-3-container shop-page-container">
                    <div className="Prouct-Image-Section">
                        <img src={KonarCard} className="Product-Image" />
                        <div className='product-description'>
                            <div className="grey-box desktop-body-xs">1-month subscription included</div>
                            <p className='desktop-h5 text-center'>Konar Card - White Edition</p>
                            <p className='desktop-body text-center'>Engineered to impress. Built to last.</p>
                            <p style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', marginTop: 10, marginBottom: 5 }}>£19.95</p>
                            <Link to="/shopnfccards/whitecard" style={{ display: 'flex', width: 'fit-content', margin: 'auto' }} className="black-button desktop-button margin-top-10">Buy Now</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="section-1-title">
                    <h2 className='desktop-h3 text-center'>Your Work. Your Card. Built to Impress.</h2>
                    <h3 className='desktop-h6 text-center'>Choose a smart, tough card that shows off your trade and makes sharing easy.</h3>
                </div>
                <div style={{ gap: 40 }} className="section-1-content">
                    <div className="section-1-left">
                        <img src={AllCards} className="" />
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
                                <p className='desktop-body-xs'>Plastic, wood, or metal — strong, clean, and made to handle job site life.</p>
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
                                <img src={PalletteIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className='desktop-h6'>Your Style, Your Logo</p>
                                <p className='desktop-body-xs'>Pick your colors, upload your logo, and match it to your business.</p>
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
                        <div className="section-list">
                            <div className=" icon-white">
                                <img src={PhoneIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className='desktop-h6'>Works on All Phones</p>
                                <p className='desktop-body-xs'>iPhone or Android — your card works on both, no apps needed.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
