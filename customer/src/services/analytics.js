import ReactGA from "react-ga4";

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initializeAnalytics = () => {
    if (!measurementId) return;

    ReactGA.initialize(measurementId);
};

export const trackPageView = (path) => {
    if (!measurementId) return;

    ReactGA.send({
        hitType: "pageview",
        page: path,
    });
};

export const trackEvent = ({
    category,
    action,
    label,
    value,
}) => {
    if (!measurementId) return;

    ReactGA.event({
        category,
        action,
        label,
        value,
    });
};