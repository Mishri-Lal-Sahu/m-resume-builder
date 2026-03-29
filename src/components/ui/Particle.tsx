"use client";
import { motion } from "framer-motion";
function Particle({ delay, x, size }: { delay: number; x: number; size: number }) {
    return (
        <motion.div
            className="absolute bottom-0 rounded-full bg-indigo-400/30 pointer-events-none"
            style={{ left: `${x}%`, width: size, height: size }}
            animate={{ y: [-10, -160], opacity: [0, 0.7, 0], scale: [1, 0.5] }}
            transition={{ duration: 4 + Math.random() * 4, delay, repeat: Infinity, ease: "easeOut" }}
        />
    );
}
export { Particle };