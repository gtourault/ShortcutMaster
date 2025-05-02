// src/animations/animationsController.ts
import gsap from "gsap";

/**
 * Animation fadeIn (apparition + montée)
 */
export const fadeIn = (
    target: HTMLElement | Element,
    delay = 0,
    yOffset = 30,
    duration = 0.8
) => {
    gsap.fromTo(
        target,
        { opacity: 0, y: yOffset },
        { opacity: 1, y: 0, duration, delay }
    );
};

/**
 * Animation scaleUp (zoom léger)
 */
export const scaleUp = (
    target: HTMLElement | Element,
    delay = 0,
    duration = 0.6
) => {
    gsap.fromTo(
        target,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration, delay, ease: "power2.out" }
    );
};

/**
 * Animation slideIn (depuis la gauche)
 */
export const slideInLeft = (
    target: HTMLElement | Element,
    delay = 0,
    distance = 50,
    duration = 0.7
) => {
    gsap.fromTo(
        target,
        { x: -distance, opacity: 0 },
        { x: 0, opacity: 1, duration, delay }
    );
};
