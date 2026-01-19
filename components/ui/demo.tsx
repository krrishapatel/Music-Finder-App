import React from 'react';
import ResponsiveHeroBanner from './responsive-hero-banner';

const HeroDemo = () => {
    return (
        <ResponsiveHeroBanner
            badgeLabel="🎵"
            badgeText="Smart Music Recognition 2026"
            title="Find Your Song"
            titleLine2="In Seconds"
            description="Hum, sing, or type lyrics to discover any song instantly. Our AI-powered music recognition finds your mystery tunes with incredible accuracy."
            primaryButtonText="Start Searching"
            secondaryButtonText="Watch Demo"
            ctaButtonText="Try Audio Search"
            partnersTitle="Trusted by millions of music lovers worldwide"
        />
    );
};

export default HeroDemo;