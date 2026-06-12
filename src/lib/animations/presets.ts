import type { Variants } from 'motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export const hoverLift = {
  rest: { y: 0 },
  hover: { y: -3, transition: { duration: 0.18 } },
};

export const floatingAnimation = {
  y: [0, -6, 0],
  transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

export const sidebarTransition = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
};
