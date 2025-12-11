interface Toast {
    id: string
    title?: string
    description?: string
    variant?: 'default' | 'success' | 'error' | 'warning'
    duration?: number
}

const toasts = ref<Toast[]>([])

export const useToast = () => {
    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).slice(2)
        const newToast: Toast = {
            id,
            duration: 5000,
            variant: 'default',
            ...toast
        }

        toasts.value.push(newToast)

        // Auto remove after duration
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

    const toast = (options: Omit<Toast, 'id'>) => {
        return addToast(options)
    }

    // Convenience methods
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

