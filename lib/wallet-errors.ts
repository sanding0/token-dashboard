import {
    ConnectorAlreadyConnectedError,
    ProviderNotFoundError,
    SwitchChainNotSupportedError,
} from 'wagmi'

export function isUserRejected(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false
    const e = error as { name?: string; code?: number; message?: string; shortMessage?: string }
    if (e.name === 'UserRejectedRequestError' || e.code === 4001) return true
    const text = `${e.message ?? ''} ${e.shortMessage ?? ''}`
    return /user rejected|connection request reset/i.test(text)
}

export function getConnectErrorMessage(error: unknown): string | null {
    if (isUserRejected(error)) return null
    if (error instanceof ConnectorAlreadyConnectedError) {
        return 'Wallet already connected'
    }

    if (error instanceof ProviderNotFoundError) {
        return 'Wallet service initialization failed, please refresh the page and try again'
    }

    if (error && typeof error === 'object' && 'shortMessage' in error) {
        const msg = (error as { shortMessage: string }).shortMessage
        if (msg) return msg
    }
    return 'Wallet connection failed, please try again later'
}

export function getSwitchChainErrorMessage(error: unknown): string | null {
    if (isUserRejected(error)) return null
    if (error instanceof SwitchChainNotSupportedError) {
        return 'The wallet does not support switching networks, please add the network manually in the wallet settings'
    }
    if (error && typeof error === 'object' && 'shortMessage' in error) {
        const msg = (error as { shortMessage: string }).shortMessage
        if (msg) return msg
    }
    return 'Switching network failed, please try again later'
}


export function getMintErrorMessage(error: unknown): string | null {
    if (isUserRejected(error)) return "User rejected the transaction"
    if (error instanceof Error) {
        return error.message
    }
    return 'Mint transaction failed, please try again later'
}