import { useToastManager } from "@base-ui/react/toast";

/**
 * Drop-in wrapper around Base UI's useToastManager.
 * Mirrors the react-hot-toast API surface used across the dashboard:
 *   toast.success(title)
 *   toast.error(title)
 *   toast.info(title)
 *   toast.loading(title, { id? })   → returns toastId
 *   toast.success(title, { id })    → updates an existing loading toast
 *   toast.error(title, { id })      → updates an existing loading toast
 *   toast.dismiss(id)
 */
export function useKonarToast() {
    const { add, close, update } = useToastManager();

    return {
        success(title, opts = {}) {
            if (opts.id) {
                update(opts.id, { title, type: "success", timeout: 2500 });
                return opts.id;
            }
            return add({ title, type: "success", timeout: 2500 });
        },
        error(title, opts = {}) {
            if (opts.id) {
                update(opts.id, { title, type: "error", timeout: 4000 });
                return opts.id;
            }
            return add({ title, type: "error", timeout: 4000 });
        },
        info(title, opts = {}) {
            return add({ title, type: "info", timeout: 3000 });
        },
        loading(title, opts = {}) {
            if (opts.id) {
                return add({ id: opts.id, title, type: "loading", timeout: 0 });
            }
            return add({ title, type: "loading", timeout: 0 });
        },
        dismiss(id) {
            close(id);
        },
    };
}
