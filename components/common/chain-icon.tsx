'use client'

import { arbitrum, mainnet, polygon, sepolia } from 'viem/chains'
import { cn } from '@/lib/utils'
type ChainIconProps = {
  chainId?: number
} & React.ImgHTMLAttributes<HTMLImageElement>

const CHAIN_ICONS = {
    [mainnet.id]: {src: '/chains/ethereum.svg', alt: 'Ethereum'},
    [arbitrum.id]: {src: '/chains/arbitrum.svg', alt: 'Arbitrum'},
    [polygon.id]: {src: '/chains/polygon.svg', alt: 'Polygon'},
    [sepolia.id]: {src: '/chains/ethereum.svg', alt: 'Sepolia'},
}

const DEFAULT_CHAIN_ICON = {src: '/chains/ethereum.svg', alt: 'Ethereum'}

export default function ChainIcon({ chainId, className, ...props }: ChainIconProps) {
    const cls = cn('shrink-0 w-4 h-4', className)
    const { src, alt } = CHAIN_ICONS[chainId as keyof typeof CHAIN_ICONS] || DEFAULT_CHAIN_ICON
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={src} alt={alt} className={cls} {...props} />
}