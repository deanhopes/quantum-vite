import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Setup all scroll-based animations for the scene
 */
export const setupScrollAnimations = (
  containerRef: HTMLElement,
  horizontalSection: Element | null,
  panels: HTMLElement[]
) => {
  if (!horizontalSection) return;

  // Get the camera from R3F
  const camera = document.querySelector("canvas")?.__r3f?.camera;
  if (!camera) return;

  // Main scroll timeline
  const mainTl = gsap.timeline({
    scrollTrigger: {
      trigger: containerRef,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
    },
  });

  // Horizontal scroll timeline
  const horizontalTl = gsap.timeline({
    scrollTrigger: {
      trigger: containerRef,
      start: "top top",
      end: "+=400vh",
      markers: true,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;
        // Rotate camera around center point
        const radius = 4;
        const angle = (progress * Math.PI) / 2;
        gsap.to(camera.position, {
          x: radius * Math.sin(angle),
          y: 1.5,
          z: radius * Math.cos(angle),
          duration: 1,
          ease: "none",
          onUpdate: () => {
            camera.lookAt(0, -0.5, 0);
            camera.updateProjectionMatrix();
          },
        });
      },
    },
  });

  // Animate horizontal section
  horizontalTl.to(horizontalSection, {
    x: () => -(window.innerWidth * 2), // Move 2 screens worth (since we have 3 sections total)
    ease: "none",
  });

  // Clean up function
  return () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    mainTl.kill();
    horizontalTl.kill();
  };
};
