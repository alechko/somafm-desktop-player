import { Box } from '@chakra-ui/react'
import { motion, MotionProps, usePresence } from 'framer-motion'

const MotionBox = motion(Box)

const transition = { type: 'spring', stiffness: 500, damping: 150, mass: 1 }

type ListItemProps = {
  animation?: MotionProps
  children: any
}

export const ListItem = ({ animation, children }: ListItemProps) => {
  const [isPresent, safeToRemove] = usePresence()
  const animations: MotionProps = {
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
      tapped: { scale: 0.98, opacity: 0.5, transition: { duration: 0.1 } },
    },
    onAnimationComplete: () => {
      !isPresent && typeof safeToRemove === 'function' && safeToRemove()
    },
    transition,
  }

  const props = Object.assign({}, animations, animation)

  return <MotionBox {...props}>{children}</MotionBox>
}
