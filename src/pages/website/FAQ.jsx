import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Breadcrumbs from '../../components/Breadcrumbs'
import Footer from '../../components/Footer'
import IDCardIcon from '../../assets/icons/IDCard-Icon.svg'
import NFCIcon from '../../assets/icons/NFC-Icon.svg'
import BoltIcon from '../../assets/icons/Bolt-Icon.svg'
import MaterialsIcon from '../../assets/icons/Materials-Icon.svg'
import Pencil from '../../assets/icons/Pencil-Icon.svg'
import ProfilePencil from '../../assets/icons/ProfilePencil-Icon.svg'
import TimeIcon from '../../assets/icons/Time-Icon.svg'
import PhoneIcon from '../../assets/icons/Phone-Icon.svg'
import NFCChipIcon from '../../assets/icons/NFCChip-Icon.svg'
import ShieldIcon from '../../assets/icons/Shield-Icon.svg'
import QRCode from '../../assets/icons/QR-Code-Icon.svg'
import ProfileIcon from '../../assets/icons/Profile-Icon.svg'
import InfoIcon from '../../assets/icons/Info-Icon.svg'
import DeliveryIcon from '../../assets/icons/Delivery-Icon.svg'
import WorldIcon from '../../assets/icons/World-Icon.svg'
import AddressIcon from '../../assets/icons/Address-Icon.svg'
import TrackIcon from '../../assets/icons/Track-Icon.svg'
import ReturnIcon from '../../assets/icons/Return-Icon.svg'
import CancelIcon from '../../assets/icons/Cancel-Icon.svg'
import DamagedIcon from '../../assets/icons/Damaged-Icon.svg'
import RefundIcon from '../../assets/icons/Refund-Icon.svg'
import EcoIcon from '../../assets/icons/Eco-Icon.svg'
import TreeIcon from '../../assets/icons/Tree-Icon.svg'
import RecycleIcon from '../../assets/icons/Recycle-Icon.svg'
import ContactIcon from '../../assets/icons/Contact-Icon.svg'
import TutorialIcon from '../../assets/icons/Tutorial-Icon.svg'





export default function FAQ() {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>
      <div style={{ marginTop: 40 }} className="section-1-title section">
        <h2 className='desktop-h1 text-center'>Got Questions? We’ve Got Answers.</h2>
        <h3 className='desktop-h6 text-center'>Everything you need to know about our cards, shipping, returns, setup, and more.</h3>
      </div>
      <div style={{ marginTop: 100 }} className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>Product Questions</h2>
          <h3 className='desktop-h6 text-center'>For curious customers before they buy.</h3>
        </div>
        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={IDCardIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>What is an NFC business card?</p>
                <p className='desktop-body-xs'>An NFC card lets you instantly share your contact information or social profiles by simply tapping a smartphone.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={NFCIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>How does the NFC card work?</p>
                <p className='desktop-body-xs'>It uses NFC technology to instantly open your digital profile when tapped on a compatible phone.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={MaterialsIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>What materials are available for the cards?</p>
                <p className='desktop-body-xs'>You can choose between Plastic, Wood, and Metal — each built for durability and style.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={Pencil} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Can I customize the design of my card?</p>
                <p className='desktop-body-xs'>Yes, you can upload your logo, choose colors, and personalize the look during setup.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={ProfilePencil} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Can I update my profile after ordering?</p>
                <p className='desktop-body-xs'>Absolutely! You can update your profile at any time without reprinting the card.</p>
              </div>
            </div>
          </div>
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={TimeIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>How long does an NFC card last?</p>
                <p className='desktop-body-xs'>With normal use, NFC cards can last for years without losing functionality.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={PhoneIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Does the card work with all smartphones?</p>
                <p className='desktop-body-xs'>Works with most phones: iPhone 7+ and most Androids with NFC enabled.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={QRCode} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>What if someone can't tap the card?</p>
                <p className='desktop-body-xs'>Every card includes a scannable QR code so your profile is always easy to access.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={NFCChipIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Is the NFC chip visible?</p>
                <p className='desktop-body-xs'>No, the NFC chip is securely hidden inside the design and doesn’t affect how it looks.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={ShieldIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Are the cards durable for daily use?</p>
                <p className='desktop-body-xs'>Yes, our cards are waterproof, scratch-resistant, and built to withstand frequent use over time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>Profile & Setup</h2>
          <h3 className='desktop-h6 text-center'>For users setting up their digital profile.</h3>
        </div>
        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={ProfileIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>How do I create my page?</p>
                <p className='desktop-body-xs'>Sign up, upload your info, and use our dashboard to fully customize your landing page.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={Pencil} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Can I change my profile information later?</p>
                <p className='desktop-body-xs'>Yes, you can easily update your profile details anytime through the dashboard without needing support.</p>
              </div>
            </div>
          </div>
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={InfoIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>What details can I add to my profile?</p>
                <p className='desktop-body-xs'>You can add contact info, services, work images, and customer reviews to showcase your business clearly.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={TimeIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>How long does it take to set up a profile?</p>
                <p className='desktop-body-xs'>Most users finish setup in under 5 minutes — just upload details, pick a layout, done.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>Shipping & Delivery</h2>
          <h3 className='desktop-h6 text-center'>For managing expectations on orders.</h3>
        </div>
        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={DeliveryIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>How long does it take to receive my card?</p>
                <p className='desktop-body-xs'>Cards ship within 1–3 days. UK next-day delivery if ordered before 3pm on weekdays.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={WorldIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Do you ship internationally?</p>
                <p className='desktop-body-xs'>Yes, we ship globally. Europe takes 3–5 days, and outside Europe may take up to 10 days.</p>
              </div>
            </div>
          </div>
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={AddressIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Can I change my shipping address?</p>
                <p className='desktop-body-xs'>Please contact our support team immediately. Changes are only possible before the card is produced.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={TrackIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Can I track my order?</p>
                <p className='desktop-body-xs'>Yes, you’ll get an email with a tracking link as soon as your card is shipped.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>Returns & Refunds</h2>
          <h3 className='desktop-h6 text-center'>For peace of mind and policies.</h3>
        </div>
        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={ReturnIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Can I return or exchange my card?</p>
                <p className='desktop-body-xs'>Customized cards are not returnable unless there is a manufacturing defect.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={CancelIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Can I cancel my order after placing it?</p>
                <p className='desktop-body-xs'>Orders can only be canceled within 2 hours after purchase due to fast production times.</p>
              </div>
            </div>
          </div>
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={DamagedIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>What if my card arrives damaged?</p>
                <p className='desktop-body-xs'>Contact our support team within 7 days — we’ll arrange a replacement.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={RefundIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>What is your refund policy?</p>
                <p className='desktop-body-xs'>Refunds are available if your item arrives damaged, defective, or if the order details are incorrect.</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>Sustainability</h2>
          <h3 className='desktop-h6 text-center'>To highlight your eco efforts!</h3>
        </div>
        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={EcoIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Are the cards eco-friendly?</p>
                <p className='desktop-body-xs'>Yes, using just one NFC card can replace thousands of paper cards over its lifetime.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={TreeIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>How does an NFC card help the environment?</p>
                <p className='desktop-body-xs'>It reduces waste, saves trees, and lowers carbon footprint compared to paper cards.</p>
              </div>
            </div>
          </div>
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={RecycleIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Do you use sustainable materials?</p>
                <p className='desktop-body-xs'>We offer eco-friendly options like wood cards made from responsibly sourced materials.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className='desktop-h3 text-center'>Support & Help</h2>
          <h3 className='desktop-h6 text-center'>For general help requests.</h3>
        </div>
        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={ContactIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>How can I contact support?</p>
                <p className='desktop-body-xs'>You can reach us via our live chat, email, or Help Center form.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={TutorialIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>Where can I find tutorials?</p>
                <p className='desktop-body-xs'>Visit our Help Center for video guides and step-by-step instructions.</p>
              </div>
            </div>
          </div>
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white">
                <img src={TimeIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>How fast is your customer support?</p>
                <p className='desktop-body-xs'>We usually reply within 24 hours on weekdays.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white">
                <img src={InfoIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className='desktop-h6'>What if I need help setting up my profile?</p>
                <p className='desktop-body-xs'>Our support team is available to guide you through setup anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      <Footer />
    </>
  )
}
