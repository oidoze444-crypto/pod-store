/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminBanners from './pages/AdminBanners';
import AdminDashboard from './pages/AdminDashboard';
import AdminFlavors from './pages/AdminFlavors';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminSettings from './pages/AdminSettings';
import Checkout from './pages/Checkout';
import Store from './pages/Store';
import MigrationGuide from './pages/MigrationGuide';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminBanners": AdminBanners,
    "AdminDashboard": AdminDashboard,
    "AdminFlavors": AdminFlavors,
    "AdminOrders": AdminOrders,
    "AdminProducts": AdminProducts,
    "AdminSettings": AdminSettings,
    "Checkout": Checkout,
    "Store": Store,
    "MigrationGuide": MigrationGuide,
}

export const pagesConfig = {
    mainPage: "Store",
    Pages: PAGES,
    Layout: __Layout,
};