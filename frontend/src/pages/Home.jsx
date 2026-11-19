import { useState } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import CustomModal from '../components/CustomModal';
import Footer from '../components/Footer';

export default function Home() { const [sidebarOpen,setSidebarOpen]=useState(false); const [category,setCategory]=useState(null); return <><Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} /><CustomModal category={category} onClose={()=>setCategory(null)} /><AnnouncementBar /><Header onMenu={()=>setSidebarOpen(true)} /><Hero onSelect={setCategory} /><Categories onSelect={setCategory} /><Footer /></>; }
