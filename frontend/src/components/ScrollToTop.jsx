// gamedrop-frontend/src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that scrolls the window to the top whenever the route changes.
 * This prevents preserving scroll position when navigating between pages in an SPA.
 */
function ScrollToTop() {
    const { pathname } = useLocation(); // Get the current pathname from the URL

    useEffect(() => {
        // When the pathname changes (i.e., route changes), scroll to the top of the page
        window.scrollTo(0, 0);
    }, [pathname]); // Re-run this effect whenever the pathname changes

    // This component doesn't render anything itself, it just performs an action
    return null;
}

export default ScrollToTop;