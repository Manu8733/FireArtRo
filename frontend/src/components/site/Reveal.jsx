import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, y = 26, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y, scale: 0.96, filter: "blur(6px)" }}
    whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
    viewport={{ once: false, margin: "-70px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default Reveal;
