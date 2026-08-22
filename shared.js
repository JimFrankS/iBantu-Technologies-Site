/**
 * shared.js — Injects the global site footer into every page.
 * To update the footer (contact details, links, copyright),
 * edit this file only. All pages will reflect the change automatically.
 */
(function () {
    const footerHTML = `
    <footer id="contact">
        <div class="footer-content">
            <div class="footer-section">
                <h3 class="footer-heading">Contact</h3>
                <a class="anchor-text" href="mailto:info@ibantu.tech">info@ibantu.tech</a><br/>
                <a class="anchor-text" href="tel:+263719729537">+263 71 972 9537</a>
            </div>
            <div class="footer-section">
                <h3 class="footer-heading">Headquarters</h3>
                <p>Shop Number 2, JB Rusike Complex</p>
                <p>Stand Number 485, Juru, Goromonzi</p>
                <p>Zimbabwe</p>
            </div>
            <div class="footer-section">
                <h3 class="footer-heading">Legal</h3>
                <a class="anchor-text" href="privacy.html">Privacy Policy</a><br/>
                <a class="anchor-text" href="terms.html">Terms of Service</a>
            </div>
        </div>
        <div class="footer-credits">
            <p>&copy; 2026 iBantu Technologies (Pvt) Ltd. All rights reserved.</p>
        </div>
        <a class="scroll-to-top" href="#top-of-page" aria-label="Scroll to top">
            <i class="fa-solid fa-arrow-up"></i>
        </a>
    </footer>`;

    const placeholder = document.getElementById('site-footer');
    if (placeholder) {
        placeholder.outerHTML = footerHTML;
    }

    const toggle = document.querySelector('[data-mobile-menu-toggle]');
    const navigation = document.getElementById('primary-navigation');
    const closeButton = navigation?.querySelector('[data-mobile-menu-close]');
    const backdrop = document.querySelector('[data-mobile-menu-backdrop]');

    if (!toggle || !navigation || !closeButton || !backdrop) return;

    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const header = navigation.closest('header');
    const pageElements = [
        ...document.querySelectorAll('body > .underlay, body > #logo-splash, body > #corner-logo, body > main, body > footer'),
        ...(header
            ? [...header.children].filter((element) => ![navigation, toggle, backdrop].includes(element))
            : [])
    ];
    let isOpen = false;
    let lastFocusedElement = toggle;

    const setInert = (element, shouldBeInert) => {
        if ('inert' in element) element.inert = shouldBeInert;
        if (shouldBeInert) {
            element.setAttribute('inert', '');
        } else {
            element.removeAttribute('inert');
        }
    };

    const updateVisualState = () => {
        const openIcon = toggle.querySelector('[data-menu-open-icon]');
        const closeIcon = toggle.querySelector('[data-menu-close-icon]');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        navigation.setAttribute('aria-hidden', String(!isOpen && !desktopQuery.matches));
        navigation.classList.toggle('is-open', isOpen);
        backdrop.setAttribute('aria-hidden', String(!isOpen));
        backdrop.classList.toggle('is-visible', isOpen);
        toggle.classList.toggle('is-active', isOpen);
        if (openIcon) openIcon.hidden = isOpen;
        if (closeIcon) closeIcon.hidden = !isOpen;
        pageElements.forEach((element) => setInert(element, isOpen));
        document.body.classList.toggle('menu-open', isOpen);
    };

    const getFocusableElements = () => [...navigation.querySelectorAll(focusableSelector)]
        .filter((element) => !element.hidden && element.getClientRects().length > 0);

    const closeMenu = ({ restoreFocus = true } = {}) => {
        if (!isOpen) return;
        isOpen = false;
        updateVisualState();
        if (restoreFocus) {
            window.setTimeout(() => {
                if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                    lastFocusedElement.focus({ preventScroll: true });
                } else {
                    toggle.focus({ preventScroll: true });
                }
            }, 0);
        }
    };

    const openMenu = () => {
        if (isOpen || desktopQuery.matches) return;
        lastFocusedElement = toggle;
        isOpen = true;
        updateVisualState();
        window.requestAnimationFrame(() => {
            closeButton.focus({ preventScroll: true });
        });
    };

    const syncToViewport = () => {
        if (desktopQuery.matches) {
            closeMenu({ restoreFocus: false });
        }
        updateVisualState();
    };

    toggle.addEventListener('click', () => {
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    closeButton.addEventListener('click', () => closeMenu());
    backdrop.addEventListener('click', () => closeMenu());

    navigation.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', (event) => {
        if (!isOpen) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            closeMenu();
            return;
        }

        if (event.key !== 'Tab') return;
        const focusableElements = getFocusableElements();
        if (!focusableElements.length) {
            event.preventDefault();
            closeButton.focus();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });

    if (typeof desktopQuery.addEventListener === 'function') {
        desktopQuery.addEventListener('change', syncToViewport);
    } else {
        desktopQuery.addListener(syncToViewport);
    }

    updateVisualState();
})();
