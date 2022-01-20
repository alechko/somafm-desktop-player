import { Box } from '@chakra-ui/react'
import { motion, MotionProps, Transition, usePresence } from 'framer-motion'

const MotionBox = motion(Box)

type ListItemProps = {
  animation?: MotionProps
  transition?: Transition
  children: any
}

export const ListItem = ({ animation, transition, children }: ListItemProps) => {
  const [isPresent, safeToRemove] = usePresence()
  const transitionProps = {
    type: 'spring',
    stiffness: 500,
    damping: 50,
    mass: 1,
    ...transition,
  }
  const animationProps: MotionProps = {
    layout: true,
    initial: 'out',
    style: {
      position: isPresent ? 'static' : 'absolute',
    },
    animate: isPresent ? 'in' : 'out',
    // whileTap: 'tapped',
    variants: {
      in: { scaleY: 1, opacity: 1 },
      out: { scaleY: 0, opacity: 0, zIndex: -1 },
      hover: { scale: 1.05, transition: { duration: 0.25 } },
      tapped: { scale: 0.95, opacity: 0.5, transition: { duration: 0.25 } },
    },
    onAnimationComplete: () => {
      !isPresent && typeof safeToRemove === 'function' && safeToRemove()
    },
    transition: transitionProps,
    ...animation,
  }

  return <MotionBox {...animationProps}>{children}</MotionBox>
}
