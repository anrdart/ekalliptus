interface Toast {
    id: string
    title?: string
    description?: string
    variant?: 'default' | 'success' | 'error' | 'warning'
    duration?: number
}

interface ToastFn {
    (options: Omit<Toast, 'id'>): string
    success: (title: string, description?: string) => string
    error: (title: string, description?: string) => string
    warning: (title: string, description?: string) => string
}

let toastIdCounter = 0

export const useToast = () => {
    const toasts = useState<Toast[]>('toasts', () => [])
    
    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = `toast-${++toastIdCounter}-${Date.now()}`
        const newToast: Toast = {
            id,
            duration: 5000,
            variant: 'default',
            ...toast
        }

        toasts.value.push(newToast)

        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, newToast.duration)
        }

        return id
    }

    const removeToast = (id: string) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    const toast = function(options: Omit<Toast, 'id'>) {
        return addToast(options)
    } as ToastFn

    toast.success = (title: string, description?: string) => {
        return addToast({ title, description, variant: 'success' })
    }

    toast.error = (title: string, description?: string) => {
        return addToast({ title, description, variant: 'error' })
    }

    toast.warning = (title: string, description?: string) => {
        return addToast({ title, description, variant: 'warning' })
    }

    return {
        toasts: readonly(toasts),
        toast,
        addToast,
        removeToast
    }
}
