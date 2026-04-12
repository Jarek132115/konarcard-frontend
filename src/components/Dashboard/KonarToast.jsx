import React from "react";
import { Toast } from "@base-ui/react/toast";
import { useToastManager } from "@base-ui/react/toast";
import "../../styling/dashboard/toast.css";

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ErrorIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 2V7.5M7 10.5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const InfoIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 6V10M7 4V4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const Spinner = () => (
    <svg className="knt-spinner" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
        <path d="M7 1.75A5.25 5.25 0 0 1 12.25 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const CloseIcon = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

function ToastIcon({ type }) {
    if (type === "success") return <CheckIcon />;
    if (type === "error") return <ErrorIcon />;
    if (type === "loading") return <Spinner />;
    return <InfoIcon />;
}

function ToastList() {
    const { toasts } = useToastManager();

    return (
        <Toast.Portal>
            <Toast.Viewport className="knt-viewport">
                {toasts.map((toast) => (
                    <Toast.Root
                        key={toast.id}
                        toast={toast}
                        className={`knt-root knt-root--${toast.type || "info"}`}
                        data-transition-status={toast.transitionStatus}
                    >
                        <div className={`knt-iconWrap knt-iconWrap--${toast.type || "info"}`}>
                            <ToastIcon type={toast.type} />
                        </div>
                        <Toast.Content className="knt-content">
                            <Toast.Title className="knt-title">{toast.title}</Toast.Title>
                            {toast.description && (
                                <Toast.Description className="knt-desc">
                                    {toast.description}
                                </Toast.Description>
                            )}
                        </Toast.Content>
                        <Toast.Close className="knt-close" aria-label="Dismiss">
                            <CloseIcon />
                        </Toast.Close>
                    </Toast.Root>
                ))}
            </Toast.Viewport>
        </Toast.Portal>
    );
}

export function KonarToastProvider({ children }) {
    return (
        <Toast.Provider>
            {children}
            <ToastList />
        </Toast.Provider>
    );
}
