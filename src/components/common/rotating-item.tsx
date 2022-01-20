import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const RotationBox = motion(Box)

type RotatingItemProps = {
  enabled?: boolean
  children: any
}

export const RotatingItem = ({ enabled = true, children }: RotatingItemProps) => {
  const animations = enabled
    ? {
        animate: { rotate: 360 },
        transition: { repeat: Infinity, duration: 2 },
      }
    : {}
  return <RotationBox {...animations}>{children}</RotationBox>
}
