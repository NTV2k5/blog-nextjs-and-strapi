'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ClientMotionWrapperProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export const ClientMotionWrapper = ({ children, ...props }: ClientMotionWrapperProps) => {
  return (
    <motion.div {...props}>
      {children}
    </motion.div>
  );
};
